import { Injectable } from '@nestjs/common';
import { AgentService } from '../common/services/agent.service';
import { generateObject, LanguageModelV1 } from 'ai';
import { MulterFile } from '../common/types/type';
import { ICPSchema } from './tools/structured-output';
import { systemPrompt } from './prompts/system-prompt';

@Injectable()
export class IcpAgentService {
  private readonly model: LanguageModelV1;
  constructor(private readonly AgentService: AgentService) {
    this.model = this.AgentService.model;
  }

  async generateIcpStructuredOutput(prompt: string, files: MulterFile[]) {
    const fileContentParts = files.map((file) => {
      const arrayBuffer = file.buffer.buffer.slice(
        file.buffer.byteOffset,
        file.buffer.byteOffset + file.buffer.byteLength,
      );

      return {
        type: 'file' as const,
        data: arrayBuffer,
        mimeType: file.mimetype,
      };
    });
    console.log(fileContentParts);
    const { object } = await generateObject({
      model: this.model,
      schema: ICPSchema,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text' as const,
              text: prompt,
            },
            ...fileContentParts,
          ],
        },
      ],
    });

    return object;
  }
}
