import { IsNotEmpty } from "class-validator";

export class GenerateIcpDto {
  @IsNotEmpty({ message: 'Name is required' })
  prompt: string;

  // @IsNotEmpty({ message: 'Conversation id is required'  })
  // conversationId: string;
}
