import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || "")?.[1];
    let id;
    try {
        id = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
        return res.status(401).json({ success: false, message: "Please sign in again" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ success: false, message: "Account not found" });
    req.user = user;
    next();
}
