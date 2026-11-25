import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import messageRouter from './routes/messagesRoutes.js'
import creditRouter from './routes/creditsRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js'


const app = express()


app.post('/app/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=> res.send('Server is Live!'))
app.use('/api/user', userRouter)
app.use('/api/chats', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter)

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    const status = error.status || (error.name === 'CastError' ? 400 : 500)
    res.status(status).json({success: false, message: status < 500 ? 'Invalid request' : 'Server error'})
})

export default app
