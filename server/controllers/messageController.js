import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { generateText, TextGenerationError } from "../configs/openai.js";
import { generateImage } from "../configs/cloudflare.js";

async function sendMessage(req, res, isImage) {
    const { chatId, prompt, isPublished } = req.body || {};
    if (!mongoose.isObjectIdOrHexString(chatId) || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ success: false, message: "A chat and a prompt are required" });
    }
    if (isImage && Array.from(prompt.trim()).length > 2048) {
        return res.status(400).json({ success: false, message: "Image prompts can contain up to 2,048 characters." });
    }
    const owner = { _id: chatId, userId: req.user._id };
    const chat = isImage ? await Chat.exists(owner) : await Chat.findOne(owner, { messages: { $slice: -32 } }).lean();
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    const cost = isImage ? 2 : 1;
    const insufficient = { success: false, message: "You don't have enough credits to use this feature" };
    if (req.user.credits < cost) return res.json(insufficient);
    const message = { role: "user", content: prompt.trim(), timestamp: Date.now(), isImage: false };
    let content;
    try {
        if (isImage) {
            content = await generateImage(message.content);
        } else {
            const history = chat.messages.filter((item, index, items) => !item.isImage && !(item.role === "user" && items[index + 1]?.isImage)).map(({ role, content }) => ({ role, content }));
            content = await generateText([...history, { role: message.role, content: message.content }]);
        }
    } catch (error) {
        if (error instanceof TextGenerationError) {
            console.error("OpenRouter generation failed", { status: error.status, message: error.message });
            return res.status(error.status).json({ success: false, message: error.message });
        }
        const status = error.response?.status ?? error.status;
        const provider = isImage ? "Cloudflare" : "OpenRouter";
        console.error("Generation request failed", { provider, status, code: error.code });
        if (status === 429) return res.status(429).json({ success: false, message: "Generation quota reached. Please try again later." });
        if ([401, 403, 404, 410].includes(status) || error.message.endsWith("not configured")) {
            return res.status(503).json({ success: false, message: provider + " generation needs administrator attention." });
        }
        if (status === 503) return res.status(503).json({ success: false, message: provider + " is temporarily unavailable. Please try again shortly." });
        return res.status(502).json({ success: false, message: "Generation failed. Please try again." });
    }

    const reply = { role: "assistant", content, timestamp: Date.now(), isImage, isPublished: isImage && isPublished === true };
    const debit = session => User.updateOne(
        { _id: req.user._id, credits: { $gte: cost } }, { $inc: { credits: -cost } }, { session }
    );
    const append = async session => {
        const result = await Chat.updateOne(owner, { $push: { messages: { $each: [message, reply] } } },
            { runValidators: true, session });
        if (!result.matchedCount) throw new Error("Chat no longer exists");
    };

    if (req.app.locals.supportsTransactions) {
        const saved = await mongoose.connection.transaction(async session => {
            if (!(await debit(session)).modifiedCount) return false;
            await append(session);
            return true;
        });
        if (!saved) return res.json(insufficient);
    } else {
        if (!(await debit(null)).modifiedCount) return res.json(insufficient);
        try {
            await append(null);
        } catch (error) {
            await User.updateOne({ _id: req.user._id }, { $inc: { credits: cost } });
            throw error;
        }
    }
    res.json({ success: true, reply, message });
}

export const textMessageController = (req, res) => sendMessage(req, res, false);
export const imageMessageController = (req, res) => sendMessage(req, res, true);
