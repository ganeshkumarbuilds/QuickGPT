import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import openaiImages from "../configs/openaiImages.js";

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

    const chat = await Chat.findOne({
      userId,
      _id: chatId,
    });

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
      ...response.choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    res.json({
      success: true,
      reply,
    });

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const imageMessageController = async (req, res) => {
  try {
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

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const imageResponse = await openaiImages.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageBase64 = imageResponse.data[0].b64_json;

    const reply = {
      role: "assistant",
      content: `data:image/png;base64,${imageBase64}`,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({
      success: true,
      reply,
    });

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -2 } }
    );
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};