import OpenAI from "openai";

const openaiImages = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
});

export default openaiImages;