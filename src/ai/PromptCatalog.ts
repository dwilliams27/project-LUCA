import { Prompt } from "@/ai/prompt";
import { GEN_PROCESS, GEN_PROCESS_DESCRIPTION, generateProcess, generateProcessDescription } from "@/ai/prompts/generators";

export class PromptCatalog {
  static readonly prompts: Record<string, Prompt[]> = {
    [GEN_PROCESS_DESCRIPTION]: generateProcessDescription,
    [GEN_PROCESS]: generateProcess
  };

  static getPrompt(name: string): Prompt {
    return this.prompts[name][0];
  }

  static getPopulatedPrompt(name: string, templateValues: Record<string, string>): string {
    const prompt = this.prompts[name][0];
    let populatedText = prompt.text;
    prompt.templateStrings.forEach(key => {
      populatedText = prompt.text.replace(`/\{\{(${key})\}\}/g`, templateValues[key]);
    });
    return populatedText;
  }
}
