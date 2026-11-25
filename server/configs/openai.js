import { OpenAI } from "openai";

export async function generateText(messages) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Text generation is not configured");
    const client = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
    const response = await client.chat.completions.create({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        messages,
    });
    const content = response.choices[0]?.message?.content;
    if (!content?.trim()) throw new Error("The provider returned an empty response");
    return content;
}
