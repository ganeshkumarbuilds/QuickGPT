import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { generateText } from '../configs/openai.js'
import { generateImage } from '../configs/cloudflare.js'

test('Gemini falls back once on overload and preserves the conversation', async t => {
    process.env.GEMINI_API_KEY = 'fixture'
    process.env.GEMINI_MODEL = 'primary'
    process.env.GEMINI_FALLBACK_MODEL = 'fallback'
    const requests = []
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        const request = JSON.parse(options.body)
        requests.push(request)
        if (request.model === 'primary') return new Response(null, {status: 503})
        return Response.json({choices: [{message: {content: 'OK'}}]})
    })
    const messages = [{role: 'user', content: 'Hello'}]
    assert.equal(await generateText(messages), 'OK')
    assert.deepEqual(requests.map(r => r.model), ['primary', 'fallback'])
    assert.deepEqual(requests[1].messages, messages)
})

test('FLUX JSON output is returned as an embeddable JPEG', async t => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'fixture'
    process.env.CLOUDFLARE_API_TOKEN = 'fixture'
    t.mock.method(axios, 'post', async (url, body) => {
        assert.ok(url.endsWith('/@cf/black-forest-labs/flux-1-schnell'))
        assert.deepEqual(body, {prompt: 'Blue circle'})
        return {data: {success: true, result: {image: '/9j/2Q=='}}}
    })
    assert.equal(await generateImage('Blue circle'), 'data:image/jpeg;base64,/9j/2Q==')
    axios.post.mock.mockImplementation(async () => ({data: {success: false}}))
    await assert.rejects(generateImage('Blue circle'), /invalid image/)
})
