import { Injectable } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { CoreMessage, generateText, LanguageModelV1, ToolSet } from 'ai';

@Injectable()
export class AgentService {
  public model: LanguageModelV1;
  constructor() {
    this.model = google('gemini-1.5-flash');
  }

  async generate(tools: ToolSet, messages: CoreMessage[]) {
    const { text } = await generateText({
      model: this.model,
      tools,
      messages,
    });

    return text;
  }
}
