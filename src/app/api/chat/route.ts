// /api/chat

import { OramaClient } from "@/lib/orama";
import { auth } from "@clerk/nextjs/server";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });
    const { accountId, messages } = await req.json();
    console.log(accountId);

    const orama = new OramaClient(parseInt(accountId));
    const lastMessage = messages[messages.length - 1];
    console.log("lastMessage", lastMessage);

    const context = await orama.vectorSearch({ term: lastMessage.content });

    const prompt = {
      role: "system",
      content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
        THE TIME NOW IS ${new Date().toLocaleString()}

  START CONTEXT BLOCK
  ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
  END OF CONTEXT BLOCK

  When responding, please keep in mind:
  - Be helpful, clever, and articulate.
  - Rely on the provided email context to inform your responses.
  - If the context does not contain enough information to answer a question, politely say you don't have enough information.
  - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
  - Do not invent or speculate about anything that is not directly supported by the email context.
  - Keep your responses concise and relevant to the user's questions or the email being composed.`,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [prompt, ...messages.filter((m: Message) => m.role === "user")],
      stream: true,
    });

    const stream = OpenAIStream(response, {
      onStart: () => console.log("Stream started"),
      onCompletion: (c) => console.log("Stream completed", c),
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in Chat", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
