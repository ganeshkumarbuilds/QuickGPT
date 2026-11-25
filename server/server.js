import 'dotenv/config'
import connectDB from './configs/db.js'
import app from './app.js'

try {
    app.locals.supportsTransactions = await connectDB()

    const port = process.env.PORT || 3000

    app.listen(port, '0.0.0.0', () => {
        console.log(`QuickGPT server is running on port ${port}`)
    })
} catch (error) {
    console.error('Database startup failed!')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)

    if (error.cause) {
        console.error('Underlying cause:', error.cause.message)
    }

    process.exit(1)
}