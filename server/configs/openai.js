import { OpenAI } from "openai";

let client;
export async function generateText(messages) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Text generation is not configured");
    client ??= new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        timeout: 60000,
        maxRetries: 1,
    });
    // Keep the current prompt intact and fit recent complete exchanges around it.
    let start = messages.length - 1;
    let remaining = 48000 - messages[start].content.length;
    while (start >= 2) {
        const user = messages[start - 2];
        const reply = messages[start - 1];
        if (user.role !== "user" || reply.role !== "assistant") break;
        remaining -= user.content.length + reply.content.length;
        if (remaining < 0) break;
        start -= 2;
    }
    const response = await client.chat.completions.create({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        messages: messages.slice(start),
    });
    const content = response.choices[0]?.message?.content;
    if (!content?.trim()) throw new Error("The provider returned an empty response");
    return content;
}
