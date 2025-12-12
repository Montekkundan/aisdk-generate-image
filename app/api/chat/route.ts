import { createGateway } from "@ai-sdk/gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import { createGenerateImageTool } from "@/tools/generate-image";

export type ChatTools = {
  generateImage: {
    input: {
      prompt: string;
    };
    output: {
      image: string;
      prompt: string;
    };
  };
};

export async function POST(req: Request) {
  const {
    messages,
    apiKey,
    openaiApiKey,
  }: {
    messages: UIMessage[];
    apiKey?: string;
    openaiApiKey?: string;
  } = await req.json();

  const gateway = createGateway({
    apiKey: apiKey || process.env.AI_GATEWAY_API_KEY,
  });

  const tools = {
    generateImage: createGenerateImageTool(openaiApiKey),
  };

  const sanitizedMessages = messages.map((message) => {
    if (message.role !== "assistant") return message;

    if (message.parts) {
      return {
        ...message,
        parts: message.parts.map((part) => {
          const p = part as any;

          if (
            p.type === "tool-generateImage" &&
            p.state === "output-available" &&
            p.output?.image
          ) {
            return {
              ...part,
              output: JSON.stringify({
                ...p.output,
                image: undefined,
              }),
            };
          }

          return part;
        }),
      };
    }
    return message;
  });

  const result = streamText({
    model: gateway("openai/gpt-4o"),
    messages: convertToModelMessages(sanitizedMessages as any),
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
    tools,
  });

  return result.toUIMessageStreamResponse();
}
