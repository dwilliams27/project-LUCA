import { AnthropicProvider, createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from "@ai-sdk/google";
import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai";
import { generateText, jsonSchema, LanguageModelV1 } from "ai";
import OpenAI from "openai";

import { 
  CostMetric, 
  IpcLlmChatRequest, 
  IpcLlmChatResponse, 
  LLM_PROVIDERS, 
  LLMProvider,
  ImageGenerationRequest,
  ImageGenerationResponse
} from "@/types";

export class AiService {
  private openai?: OpenAIProvider;
  private google?: GoogleGenerativeAIProvider;
  private anthropic?: AnthropicProvider;
  private openaiImageClient?: OpenAI; // Separate client just for image generation
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
        inputToken: 0.0000025,
        outputToken: 0.00001
      }
    },
  };

  constructor() {
    if (import.meta.env.MAIN_VITE_OPENAI_API_KEY) {
      this.openai = createOpenAI({
        apiKey: import.meta.env.MAIN_VITE_OPENAI_API_KEY
      });
      
      // Initialize the OpenAI client for image generation
      this.openaiImageClient = new OpenAI({
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
    if (import.meta.env.MAIN_VITE_DEBUG_ENABLE_APIS === "false") {
      return {
        modelConfig: req.modelConfig,
        text: "Debug: Not making API call",
        toolCalls: [],
      }
    }

    let model: LanguageModelV1 | null = null;
    let providerOptions: any = null;
    switch (req.modelConfig.provider) {
      case (LLM_PROVIDERS.ANTHROPIC): {
        if (!this.anthropic) {
          throw new Error("Anthropic provider missing! Did you set MAIN_VITE_ANTHROPIC_AI_API_KEY?");
        }
        model = this.anthropic(req.modelConfig.modelName);
        break;
      }
      case (LLM_PROVIDERS.OPENAI): {
        if (!this.openai) {
          throw new Error("Openai provider missing! Did you set MAIN_VITE_OPENAI_AI_API_KEY?");
        }
        model = this.openai(req.modelConfig.modelName);
        providerOptions = { openai: { reasoningEffort: 'high' }};
        break;
      }
      case (LLM_PROVIDERS.GOOGLE): {
        if (!this.google) {
          throw new Error("Openai provider missing! Did you set MAIN_VITE_GOOGLE_GENERATIVE_AI_API_KEY?");
        }
        model = this.google(req.modelConfig.modelName);
        break;
      }
      default: {
        throw new Error("Must provide a model to use!");
      }
    }

    console.log(`Generating completion with ${model.modelId}`, req);
    
    Object.keys(req.tools).forEach((key) => {
      const params = jsonSchema(req.tools[key].parameters);
      // OpenAI demanded this
      params.jsonSchema.additionalProperties = false;
      req.tools[key].parameters = params;
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
    const queryCost = this.updateCostMetrics(req.modelConfig.provider, result.usage.promptTokens, result.usage.completionTokens);
    console.log('Text: ', text);
    console.log('ToolCalls: ', toolCalls);
    console.log(`Query Cost: $${queryCost.toFixed(4)} ${result.usage.promptTokens} in, ${result.usage.completionTokens} out`);

    return {
      modelConfig: req.modelConfig,
      text,
      toolCalls,
    };
  }

  private updateCostMetrics(provider: LLMProvider, inputTokens: number, outputTokens: number) {
    const newTotalIn = this.costMetrics[provider].totalInputTokens + inputTokens;
    const newTotalOut = this.costMetrics[provider].totalOutputTokens + outputTokens;
    const newTotal = this.costMetrics[provider].totalCost + inputTokens * this.costMetrics[provider].tokenCostProfile.inputToken + outputTokens * this.costMetrics[provider].tokenCostProfile.outputToken;

    this.costMetrics[provider] = {
      ...this.costMetrics[provider],
      totalInputTokens: newTotalIn,
      totalOutputTokens: newTotalOut,
      totalCost: newTotal
    }
    
    return inputTokens * this.costMetrics[provider].tokenCostProfile.inputToken + outputTokens * this.costMetrics[provider].tokenCostProfile.outputToken;
  }

  getCostMetrics() {
    const totalCost = Object.values(this.costMetrics).reduce((sum, metric) => sum + metric.totalCost, 0);
    const totalInputTokens = Object.values(this.costMetrics).reduce((sum, metric) => sum + metric.totalInputTokens, 0);
    const totalOutputTokens = Object.values(this.costMetrics).reduce((sum, metric) => sum + metric.totalOutputTokens, 0);
    
    return {
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      providerMetrics: this.costMetrics
    };
  }

  async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (import.meta.env.MAIN_VITE_DEBUG_ENABLE_APIS === "false") {
      return {
        url: "",
        b64_json: ""
      };
    }

    if (!this.openaiImageClient) {
      throw new Error("OpenAI image client not initialized! Did you set MAIN_VITE_OPENAI_API_KEY?");
    }

    console.log(`Generating image with prompt: "${req.prompt}"`);
    
    try {
      const response = await this.openaiImageClient.images.generate({
        model: req.model || "dall-e-3",
        prompt: req.prompt,
        n: req.n || 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
        style: "vivid"
      });

      // The response contains an array of images, we'll return the first one
      const generatedImage = response.data[0];

      console.log(`Successfully generated image for prompt "${req.prompt}"`);
      
      // Return both URL and base64 data to give client flexibility in rendering
      return {
        url: generatedImage.url || "",
        b64_json: generatedImage.b64_json || ""
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }
}
