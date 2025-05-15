import { Injectable } from '@nestjs/common';
import { AgentService } from '../common/services/agent.service';
import { generateObject, LanguageModelV1 } from 'ai';
import { MulterFile } from '../common/types/type';
import { ICPSchema } from './tools/structured-output';

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
          content: `
          You are an expert Ideal Customer Profile (ICP) analyst. Your primary task is to meticulously analyze the provided text document(s) which describe a company, its products/services, and its target audience.
Your goal is to extract relevant information from this text and use it to populate the predefined fields of an ICP data structure. You have been given tools that define the specific fields and format required for this ICP.
Focus solely on the information present within the provided document(s). Populate each field of the ICP structure based only on what is explicitly stated or can be strongly inferred from the text.
If information for a specific array-based field in the ICP structure is not found in the text, you should return an empty array ([]) for that field. Do not invent information or use external knowledge beyond the provided text.
Your final output should be the populated ICP data structure according to the tools you have.
          `,
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
