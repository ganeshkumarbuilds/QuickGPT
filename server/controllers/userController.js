import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

}


export const registerUser = async (req, res) => {
    const { name, email, password } = req.body || {};
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
        return res.status(400).json({success: false, message: "Name, email and password are required"})
    }

    try {
        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: "User already exists"})
        } 
        const user = await User.create({name, email, password})
        const token = generateToken(user._id)
        res.json({success: true, token})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
        return res.status(400).json({success: false, message: "Email and password are required"})
    }
    try {
        const user = await User.findOne({email}).select("+password")
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)

            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success: true, token})
            }
        }
        return res.json({success:false, message: "Invalid email or password"})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }

}


export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({success: true, user})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
    
}

export const getPublishedImages = async (req, res) => {
    try {
        const publishImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            { $sort: { "messages.timestamp": -1 } },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$username"
                }
            }
        ])
        res.json({success: true, images: publishImageMessages})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
    
}