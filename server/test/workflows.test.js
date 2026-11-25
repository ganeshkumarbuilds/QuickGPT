import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import mongoose from 'mongoose'
import Stripe from 'stripe'
import axios from 'axios'
import app from '../app.js'
import User from '../models/User.js'
import Chat from '../models/Chat.js'

test('QuickGPT HTTP workflows', async t => {
    const dbName = 'quickgpt_test_' + randomUUID().replaceAll('-', '')
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', {
        dbName, serverSelectionTimeoutMS: 5000,
    })
    t.after(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.disconnect()
    })
    const topology = await mongoose.connection.db.admin().command({hello: 1})
    app.locals.supportsTransactions = Boolean(topology.setName || topology.msg === 'isdbgrid')
    Object.assign(process.env, {
        JWT_SECRET: 'local-regression-test', GEMINI_API_KEY: 'test',
        CLOUDFLARE_ACCOUNT_ID: 'test', CLOUDFLARE_API_TOKEN: 'test',
        STRIPE_SECRET_KEY: 'sk_test_local', STRIPE_WEBHOOK_SECRET: 'whsec_local',
        CLIENT_URL: 'http://localhost:5173',
    })
    const server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    t.after(() => new Promise(resolve => server.close(resolve)))
    const base = `http://127.0.0.1:${server.address().port}`
    const http = globalThis.fetch
    const api = async (route, { token, body, method = body ? 'POST' : 'GET' } = {}) => {
        const res = await http(base + '/api' + route, {
            method, headers: { 'Content-Type': 'application/json', ...(token && {Authorization: 'Bearer ' + token}) },
            body: body && JSON.stringify(body),
        })
        return { status: res.status, ...await res.json() }
    }
    const credentials = { name: 'Test', email: 'test@example.invalid', password: 'fixture-password' }
    let token, otherToken, userId, chatId
    await t.test('register, log in, and load a profile without exposing the password hash', async () => {
        assert.equal((await api('/user/data')).status, 401)
        assert.equal((await api('/user/register', {body: credentials})).success, true)
        assert.equal((await api('/user/register', {body: credentials})).success, false)
        assert.equal((await api('/user/login', {body: {...credentials, password: 'incorrect'}})).success, false)
        token = (await api('/user/login', {body: credentials})).token
        otherToken = (await api('/user/register', {body: {...credentials, email: 'other@example.invalid'}})).token
        const {user} = await api('/user/data', {token})
        assert.equal(user.credits, 20)
        assert.equal(user.password, undefined)
        userId = user._id
    })
    await t.test('create and list a chat scoped to its owner', async () => {
        chatId = (await api('/chats/create', {token, method: 'POST'})).chat._id
        assert.deepEqual((await api('/chats/get', {token})).chats.map(chat => chat._id), [chatId])
        assert.deepEqual((await api('/chats/get', {token: otherToken})).chats, [])
    })
    const completions = []
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        const {messages} = JSON.parse(options.body)
        completions.push(messages)
        return Response.json({choices: [{message: {content: 'Test reply'}}]})
    })
    const send = (mode, prompt, extra = {}) => api('/message/' + mode, {token, body: {chatId, prompt, ...extra}})
    const balance = async () => (await api('/user/data', {token})).user.credits
    await t.test('retain text history, reject empty prompts, and debit successful replies', async () => {
        assert.equal((await send('text', '   ')).status, 400)
        assert.equal((await send('text', 'First')).reply.content, 'Test reply')
        assert.equal((await send('text', 'Follow-up')).success, true)
        assert.deepEqual(completions.at(-1).map(item => item.content), ['First', 'Test reply', 'Follow-up'])
        assert.equal(await balance(), 18)
    })
    await t.test('publish only opted-in images and retain credit after provider failure', async () => {
        t.mock.method(axios, 'post', async () => ({data: Buffer.from([1, 2]), headers: {'content-type': 'image/png'}}))
        await send('image', 'Private image')
        const published = await send('image', 'Public image', {isPublished: true})
        assert.equal(published.reply.isImage, true)
        assert.deepEqual((await api('/user/published-images')).images, [{userName: 'Test', imageUrl: published.reply.content}])
        axios.post.mock.mockImplementation(() => { throw new Error('Provider offline') })
        assert.equal((await send('image', 'Failed')).status, 502)
        assert.equal(await balance(), 14)
        assert.equal((await api('/chats/get', {token})).chats[0].messages.length, 8)
    })
    await t.test('a failed history write leaves the credit balance and chat unchanged', async context => {
        context.mock.method(Chat, 'updateOne', async () => { throw new Error('Simulated write failure') })
        assert.equal((await send('text', 'Storage failure')).status, 500)
        assert.equal(await balance(), 14)
        assert.equal((await api('/chats/get', {token})).chats[0].messages.length, 8)
    })
    await t.test('simultaneous sends with one remaining credit persist one exchange', async () => {
        await User.updateOne({_id: userId}, {$set: {credits: 1}})
        const results = await Promise.all([send('text', 'One'), send('text', 'Two')])
        assert.equal(results.filter(result => result.success).length, 1)
        assert.equal(await balance(), 0)
        assert.equal((await api('/chats/get', {token})).chats[0].messages.length, 10)
    })
    await t.test('checkout selects the requested plan and repeated signed deliveries credit its owner once', async () => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        let checkout
        t.mock.method(Object.getPrototypeOf(stripe.checkout.sessions), 'create', async params => {
            checkout = params
            return {url: 'https://checkout.example.invalid/session'}
        })
        assert.equal((await api('/credit/purchase', {token, body: {planId: 'missing'}})).success, false)
        assert.deepEqual((await api('/credit/plan')).plans.map(plan => plan._id), ['basic', 'pro', 'premium'])
        assert.equal((await api('/credit/purchase', {token, body: {planId: 'pro'}})).success, true)
        assert.equal(checkout.line_items[0].price_data.unit_amount, 2000)
        const statusRoute = '/credit/purchase/' + checkout.metadata.transactionId
        assert.equal((await api(statusRoute, {token})).isPaid, false)
        assert.equal((await api(statusRoute, {token: otherToken})).status, 404)
        async function deliver(paymentStatus, validSignature = true) {
            const payload = JSON.stringify({type: 'checkout.session.completed', data: {object: {
                metadata: checkout.metadata, currency: 'usd', amount_total: 2000, payment_status: paymentStatus,
            }}})
            const signature = stripe.webhooks.generateTestHeaderString({payload, secret: process.env.STRIPE_WEBHOOK_SECRET})
            const res = await http(base + '/app/stripe', {method: 'POST', body: payload, headers: {
                'Content-Type': 'application/json', 'stripe-signature': validSignature ? signature : 'invalid',
            }})
            return res.status
        }
        assert.equal(await deliver('paid', false), 400)
        assert.equal(await deliver('unpaid'), 200)
        assert.equal(await balance(), 0)
        assert.deepEqual(await Promise.all([deliver('paid'), deliver('paid')]), [200, 200])
        t.mock.method(Object.getPrototypeOf(stripe.checkout.sessions), 'list', async () => ({data: [{
            metadata: checkout.metadata, currency: 'usd', amount_total: 2000, payment_status: 'paid',
        }]}))
        const payload = JSON.stringify({type: 'payment_intent.succeeded', data: {object: {id: 'pi_test'}}})
        const signature = stripe.webhooks.generateTestHeaderString({payload, secret: process.env.STRIPE_WEBHOOK_SECRET})
        assert.equal((await http(base + '/app/stripe', {method: 'POST', body: payload, headers: {
            'Content-Type': 'application/json', 'stripe-signature': signature,
        }})).status, 200)
        assert.equal(await deliver('paid'), 200)
        assert.equal(await balance(), 500)
        assert.equal((await api('/user/data', {token: otherToken})).user.credits, 20)
        assert.equal((await api(statusRoute, {token})).isPaid, true)
    })
    await t.test('delete a chat and remove its published images', async () => {
        assert.equal((await api('/chats/delete', {token: otherToken, body: {chatId}})).status, 404)
        assert.equal((await api('/chats/delete', {token, body: {chatId}})).success, true)
        assert.deepEqual((await api('/chats/get', {token})).chats, [])
        assert.deepEqual((await api('/user/published-images')).images, [])
    })
})
