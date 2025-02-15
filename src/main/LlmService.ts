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

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey
    });
  }

  async query(prompt: string, tools: Tool[]): Promise<Message> {
    console.log('Sending query to LLM:', prompt, tools);
    const message = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompt
      }],
      tools
    });

    this.costMetrics.totalInputTokens += message.usage.input_tokens;
    this.costMetrics.totalOutputTokens += message.usage.output_tokens;
    const queryCost = this.calculateCost(message.usage.input_tokens, message.usage.output_tokens);
    this.costMetrics.totalCost += queryCost;

    console.warn(`LLM Call: $${queryCost.toFixed(4)} ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`);

    return message;
  }

  private calculateCost(inputTokens: number, outputTokens: number) {
    return (
      inputTokens * 0.000003 +
      outputTokens * 0.000015
    );
  }
}
