import "dotenv/config";
import { createInterface } from "node:readline/promises";
import type Anthropic from "@anthropic-ai/sdk";
import { db } from "./db.js";
import { streamReply } from "./claude.js";

async function getOrCreateConversation(id?: string) {
  if (id) {
    const existing = await db.conversation.findUnique({ where: { id } });
    if (existing) return existing;
    console.log(`No conversation with id ${id}, starting a new one.`);
  }
  return db.conversation.create({ data: {} });
}

async function loadHistory(conversationId: string): Promise<Anthropic.MessageParam[]> {
  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

async function main() {
  const conversationIdArg = process.argv[2];
  const conversation = await getOrCreateConversation(conversationIdArg);
  console.log(`Conversation: ${conversation.id}`);
  console.log("Type your message and press enter. Ctrl+C to quit.\n");

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    const userInput = await rl.question("you> ");
    if (!userInput.trim()) continue;

    await db.message.create({
      data: { conversationId: conversation.id, role: "user", content: userInput },
    });

    const history = await loadHistory(conversation.id);

    process.stdout.write("claude> ");
    let fullReply = "";
    await streamReply(history, (token) => {
      fullReply += token;
      process.stdout.write(token);
    });
    process.stdout.write("\n\n");

    await db.message.create({
      data: { conversationId: conversation.id, role: "assistant", content: fullReply },
    });
  }
}

main().finally(() => db.$disconnect());
