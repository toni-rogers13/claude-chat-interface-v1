import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function streamReply(
  history: Anthropic.MessageParam[],
  onToken: (text: string) => void,
): Promise<string> {
  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 4096,
    messages: history,
  });

  stream.on("text", onToken);

  const finalMessage = await stream.finalMessage();
  const textBlock = finalMessage.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  return textBlock?.text ?? "";
}
