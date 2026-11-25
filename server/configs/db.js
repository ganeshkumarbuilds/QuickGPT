import mongoose from "mongoose";

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri || !process.env.JWT_SECRET) {
        throw new Error("MONGODB_URI and JWT_SECRET must be configured");
    }
    // Keep the historical default while respecting a database supplied in the URI.
    const database = uri.split("?")[0].replace(/^mongodb(?:\+srv)?:\/\/[^/]+/, "").slice(1);
    await mongoose.connect(uri, database ? {} : { dbName: "quickgpt" });
    const topology = await mongoose.connection.db.admin().command({ hello: 1 });
    return Boolean(topology.setName || topology.msg === "isdbgrid");
}
