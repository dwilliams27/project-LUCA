export class Prompt {
  name: string;
  text: string;
  templateStrings: string[];
  version: string;

  constructor(name: string, text: string, templateStrings: string[], version: string) {
    this.name = name;
    this.text = text;
    this.templateStrings = templateStrings;
    this.version = version;
  }

  populate(templateValues: Record<string, string>): string {
    let populatedText = this.text;
    this.templateStrings.forEach(key => {
      populatedText = this.text.replace(`/\{\{(${key})\}\}/g`, templateValues[key]);
    });
    return populatedText;
  }
}
