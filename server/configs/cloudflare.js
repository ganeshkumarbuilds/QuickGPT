import axios from "axios";

export const generateImage = async (prompt) => {
  try {

    console.log("ACCOUNT ID:", process.env.CLOUDFLARE_ACCOUNT_ID);
    console.log(
      "TOKEN:",
      process.env.CLOUDFLARE_API_TOKEN ? "Present" : "Missing"
    );

    const url =
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

    console.log("URL:", url);

    const response = await axios.post(
      url,
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

  } catch (error) {

    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data?.toString());

    throw error;
  }
};

export default generateImage;