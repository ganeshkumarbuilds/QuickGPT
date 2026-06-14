import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You don't have enough credits to use this feature",
            });
        }
        const { chatId, prompt } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found",
            });
        }
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });
        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        
        const reply = {
            role: "assistant",
            content: response.choices[0].message.content,
            timestamp: Date.now(),
            isImage: false,
        };
        
        chat.messages.push(reply);
        await chat.save();
        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );
        
        return res.json({
            success: true,
            reply,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

export const imageMessageController = async (req, res) => {
    try {
        console.log("POLLINATIONS IMAGE CONTROLLER");
        const userId = req.user._id;
        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You don't have enough credits to use this feature",
            });
        }
        const { prompt, chatId, isPublished } = req.body;
        const chat = await Chat.findOne({
            userId,
            _id: chatId,
        });
        
        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found",
            });
        }
        
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        
        const reply = {
            role: "assistant",
            content: imageUrl,
            timestamp: Date.now(),
            isImage: true,
            isPublished,
        };
        
        chat.messages.push(reply);
        await chat.save();
        
        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        );
        
        return res.json({
            success: true,
            reply,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};