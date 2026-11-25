import axios from "axios";

export async function generateImage(prompt) {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        throw new Error("Image generation is not configured");
    }
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;
    const response = await axios.post(url, { prompt }, {
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
        responseType: "arraybuffer",
        timeout: 120000,
    });
    const type = response.headers["content-type"]?.split(";")[0];
    if (!["image/png", "image/jpeg", "image/webp"].includes(type) || !response.data.length) {
        throw new Error("The provider returned an invalid image");
    }
    return `data:${type};base64,${Buffer.from(response.data).toString("base64")}`;
}
