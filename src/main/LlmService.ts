import { LucaMessage } from '@/types';
import Anthropic from '@anthropic-ai/sdk';
import { Message, Tool } from '@anthropic-ai/sdk/resources';

export class LLMService {
  static name = "LLMService";

  private anthropic: Anthropic;
  private costMetrics = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0
  };
  private lastQueryTime = 0;
  private readonly RATE_LIMIT_MS = 5000;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey
    });
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastQuery = now - this.lastQueryTime;
    if (timeSinceLastQuery < this.RATE_LIMIT_MS) {
      console.warn('LLM Rate limit hit');
      const delayMs = this.RATE_LIMIT_MS - timeSinceLastQuery;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    this.lastQueryTime = Date.now();
  }

  async query(messages: LucaMessage[], tools: Tool[]): Promise<Message> {
    console.log('Queuing LLM query...');
    await this.enforceRateLimit();
    console.log('Sending query to LLM:', messages, tools);
    const message = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      messages: messages.map((m) => ({ role: m.role, content: [{ type: 'text', text: m.content }]})),
      tools
    });

    this.costMetrics.totalInputTokens += message.usage.input_tokens;
    this.costMetrics.totalOutputTokens += message.usage.output_tokens;
    const queryCost = this.calculateCost(message.usage.input_tokens, message.usage.output_tokens);
    this.costMetrics.totalCost += queryCost;

    console.warn(`LLM Call: $${queryCost.toFixed(4)} ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`);

    console.log('LLM response:', message)

    return message;
  }

  private calculateCost(inputTokens: number, outputTokens: number) {
    return (
      inputTokens * 0.000003 +
      outputTokens * 0.000015
    );
  }
}
