import { IpcLlmChatRequest, IpcLlmChatResponse, LLM_PROVIDERS, LLMProvider } from "@/types";
import { AnthropicProvider, createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from "@ai-sdk/google";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { generateText, jsonSchema, LanguageModelV1 } from "ai";

interface CostMetric {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  tokenCostProfile: TokenCostProfile
};

interface TokenCostProfile {
  inputToken: number,
  outputToken: number
};

export class AiService {
  private openai?: OpenAIProvider;
  private google?: GoogleGenerativeAIProvider;
  private anthropic?: AnthropicProvider;
  private costMetrics: Record<string, CostMetric> = {
    [LLM_PROVIDERS.ANTHROPIC]: {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      tokenCostProfile: {
        inputToken: 0.000003,
        outputToken: 0.000015
      }
    },
    [LLM_PROVIDERS.GOOGLE]: {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      tokenCostProfile: {
        inputToken: 0.000001,
        outputToken: 0.000004
      }
    },
    [LLM_PROVIDERS.OPENAI]: {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      tokenCostProfile: {
        inputToken: -1,
        outputToken: -1
      }
    },
  };

  constructor() {
    if (import.meta.env.MAIN_VITE_OPENAI_API_KEY) {
      this.openai = createOpenAI({
        apiKey: import.meta.env.MAIN_VITE_OPENAI_API_KEY
      });
    }
    if (import.meta.env.MAIN_VITE_GOOGLE_GENERATIVE_AI_API_KEY) {
      this.google = createGoogleGenerativeAI({
        apiKey: import.meta.env.MAIN_VITE_GOOGLE_GENERATIVE_AI_API_KEY
      });
    }
    if (import.meta.env.MAIN_VITE_ANTHROPIC_API_KEY) {
      this.anthropic = createAnthropic({
        apiKey: import.meta.env.MAIN_VITE_ANTHROPIC_API_KEY
      });
    }
  }

  async generateText(req: IpcLlmChatRequest): Promise<IpcLlmChatResponse> {
    let model: LanguageModelV1 | null = null;
    let providerOptions: any = null;
    switch (req.provider) {
      case (LLM_PROVIDERS.ANTHROPIC): {
        if (!this.anthropic) {
          throw new Error("Anthropic provider missing! Did you set MAIN_VITE_ANTHROPIC_AI_API_KEY?");
        }
        model = this.anthropic("claude-3-5-sonnet-latest");
        break;
      }
      case (LLM_PROVIDERS.OPENAI): {
        if (!this.openai) {
          throw new Error("Openai provider missing! Did you set MAIN_VITE_OPENAI_AI_API_KEY?");
        }
        model = this.openai("o3-mini");
        providerOptions = { openai: { reasoningEffort: 'high' }};
        break;
      }
      case (LLM_PROVIDERS.GOOGLE): {
        if (!this.google) {
          throw new Error("Openai provider missing! Did you set MAIN_VITE_GOOGLE_GENERATIVE_AI_API_KEY?");
        }
        model = this.google("gemini-2.0-flash");
        break;
      }
      default: {
        throw new Error("Must provide a model to use!");
      }
    }

    console.log(`Generating completion with ${model.modelId}`, req);
    
    Object.keys(req.tools).forEach((key) => {
      console.log(key);
      console.log(req.tools[key].parameters);
      console.log(jsonSchema(req.tools[key].parameters));
      req.tools[key].parameters = jsonSchema(req.tools[key].parameters);
    });
    const result = await generateText({
      model,
      system: req.system,
      prompt: req.prompt,
      tools: req.tools,
      ...(providerOptions ? providerOptions : {})
    });

    const text = result.steps[0].text;
    const toolCalls = result.steps[0].toolCalls;
    const queryCost = this.updateCostMetrics(req.provider, result.usage.promptTokens, result.usage.completionTokens);
    console.log('Text: ', text);
    console.log('ToolCalls: ', toolCalls);
    console.log(`Query Cost: $${queryCost.toFixed(4)} ${result.usage.promptTokens} in, ${result.usage.completionTokens} out`);

    return {
      text,
      toolCalls,
    };
  }

  private updateCostMetrics(provider: LLMProvider, inputTokens: number, outputTokens: number) {
    const newTotalIn = this.costMetrics[provider].totalInputTokens + inputTokens;
    const newTotalOut = this.costMetrics[provider].totalOutputTokens + outputTokens;
    const newTotal = this.costMetrics[provider].totalCost + newTotalIn * this.costMetrics[provider].tokenCostProfile.inputToken + newTotalOut * this.costMetrics[provider].tokenCostProfile.outputToken;

    this.costMetrics[provider] = {
      ...this.costMetrics[provider],
      totalInputTokens: newTotalIn,
      totalOutputTokens: newTotalOut,
      totalCost: newTotal
    }
    
    return inputTokens * this.costMetrics[provider].tokenCostProfile.inputToken + outputTokens * this.costMetrics[provider].tokenCostProfile.outputToken;
  }
}
