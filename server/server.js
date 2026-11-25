import 'dotenv/config'
import connectDB from './configs/db.js'
import app from './app.js'

try {
    app.locals.supportsTransactions = await connectDB()
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`Server is running on port ${port}`))
} catch (error) {
    console.error('Database startup failed:', error.name)
    process.exitCode = 1
}
