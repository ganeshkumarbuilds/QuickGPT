import Chat from '../models/Chat.js'

export const createChat = async (req, res) => {
  try {
    const userId = req.user._id

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
      username: req.user.name
    }

    const newChat = await Chat.create(chatData)
    res.json({success: true, message: "Chat created", chat: newChat})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id
    const chats = await Chat.find({userId}).sort({updatedAt: -1})
    res.json({success: true, chats})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.body
    await Chat.deleteOne({_id: chatId, userId: req.user._id})
    res.json({success: true, message: "Chat Deleted"})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}