import axios from "axios";

export async function generateImage(prompt) {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        throw new Error("Image generation is not configured");
    }
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const response = await axios.post(url, { prompt }, {
        headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
        responseType: "json",
        timeout: 120000,
    });
    const image = response.data?.result?.image;
    if (!response.data?.success || typeof image !== "string" || !image.length) {
        throw new Error("The provider returned an invalid image");
    }
    return `data:image/jpeg;base64,${image}`;
}
