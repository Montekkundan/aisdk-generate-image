import { createOpenAI } from "@ai-sdk/openai";
import { experimental_generateImage, tool } from "ai";
import z from "zod";

export const createGenerateImageTool = (apiKey?: string) => {
  const openai = createOpenAI({
    apiKey,
  });

  return tool({
    description: "Generate an image",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate the image from"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: openai.image("dall-e-3"),
        prompt,
      });
      return { image: image.base64, prompt };
    },
  });
};
