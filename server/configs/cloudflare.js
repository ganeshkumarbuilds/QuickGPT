import axios from "axios";

export const generateImage = async (prompt) => {
  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
    {
      prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  const imageBuffer = Buffer.from(response.data);

  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
};

export default generateImage