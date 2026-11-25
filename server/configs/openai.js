import { OpenAI } from "openai";

export class TextGenerationError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function publicError(error) {
    if (error instanceof TextGenerationError) return error;
    if (error instanceof OpenAI.APIConnectionTimeoutError || [408, 504].includes(error.status)) {
        return new TextGenerationError(504, "Text generation timed out. Please try again.");
    }
    if (error instanceof OpenAI.APIConnectionError) {
        return new TextGenerationError(502, "Could not reach OpenRouter. Please try again.");
    }
    switch (error.status) {
        case 401:
        case 403:
            return new TextGenerationError(503, "OpenRouter denied access. Contact the administrator.");
        case 402:
            return new TextGenerationError(503, "The OpenRouter account has insufficient credits. Contact the administrator.");
        case 400:
        case 404:
        case 410:
        case 422:
            return new TextGenerationError(502, "OpenRouter could not accept the request with the configured model.");
        case 429:
            return new TextGenerationError(429, "OpenRouter is rate-limiting requests. Please try again later.");
        case 503:
            return new TextGenerationError(503, "The text model is temporarily unavailable. Please try again later.");
        default:
            return new TextGenerationError(502, "OpenRouter could not complete the request. Please try again.");
    }
}

let client;
export async function generateText(messages) {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) throw new TextGenerationError(503, "OpenRouter text generation is not configured.");
    if (!client || client.apiKey !== apiKey) {
        client = new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1", timeout: 60000, maxRetries: 0 });
    }
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
    const primary = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";
    const fallback = process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "openrouter/free";
    async function complete(model) {
        const response = await client.chat.completions.create({ model, messages: messages.slice(start) });
        const choice = response?.choices?.[0];
        const failure = response?.error ?? choice?.error;
        if (failure) throw Object.assign(new Error("Upstream generation failed"), { status: Number(failure.code) });
        const content = choice?.message?.content;
        if (choice?.finish_reason === "error" || typeof content !== "string" || !content.trim()) {
            throw new TextGenerationError(502, "OpenRouter returned an invalid text reply. Please try again.");
        }
        return content;
    }
    try {
        return await complete(primary);
    } catch (error) {
        if (primary === fallback || ![404, 410, 503].includes(error.status)) throw publicError(error);
    }
    try {
        return await complete(fallback);
    } catch (error) {
        throw publicError(error);
    }
}
