import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createGateway } from '@ai-sdk/gateway';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    apiKey,
  }: {
    messages: UIMessage[];
    apiKey?: string;
  } = await req.json();

  const gateway = createGateway({
    apiKey: apiKey || process.env.AI_GATEWAY_API_KEY,
  });

  const result = streamText({
    model: gateway('meituan/longcat-flash-chat'),
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });

  return result.toUIMessageStreamResponse();

}