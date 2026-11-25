import mongoose from "mongoose";

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri || !process.env.JWT_SECRET) {
        throw new Error("MONGODB_URI and JWT_SECRET must be configured");
    }

    const parsedUri = new URL(uri);
    const database = parsedUri.pathname.slice(1);

    await mongoose.connect(uri, {
        ...(database ? {} : { dbName: "quickgpt" }),
        serverSelectionTimeoutMS: 15000,
    });

    const topology = await mongoose.connection.db.admin().command({
        hello: 1,
    });

    console.log("MongoDB connected successfully");

    return Boolean(topology.setName || topology.msg === "isdbgrid");
}