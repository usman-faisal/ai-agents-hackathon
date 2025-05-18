import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { MulterFile } from '../common/types/type';
import { Message as PrismaMessage, ICP, MessageRole, Conversation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { GenerateIcpDto } from './dto/generate-icp.dto';
import { CoreMessage, Message, ToolCallPart, ToolResultPart } from 'ai';
import { getFileContentParts } from 'src/common/utils/hash';
import { HttpService } from '@nestjs/axios';
import { ICPSchema } from './dto/llm-icp-structure';

@Injectable()
export class IcpService {
    constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService) { }

    private mapMessagesToLLMMessages(messages: Partial<PrismaMessage>[]): {role: string, content: string}[] {
        return messages.map((message) => {
            return {
                content: message.content,
                role: message.role,
            }
        })
    }

    async chatIcp(userId: string, prompt: string, files: MulterFile[]) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    icp: true,
                    conversation: {
                        include: {
                            messages: {
                                orderBy: {
                                    createdAt: 'asc',
                                },
                            }
                        }
                    }
                }
            })

            let conversation: Prisma.ConversationGetPayload<{
                include: { messages: true }
              }> | null = user.conversation;
            
            let icp: ICP | null = user.icp;

            if (!user.conversation) {
                // create conversation
                conversation = await this.prismaService.conversation.create({
                    data: {
                        userId: user.id,
                    }, 
                    include: {
                        messages: true,
                    }
                })
            }
            if (!user.icp) {
                // create icp
                icp = await this.prismaService.iCP.create({
                    data: {
                        userId: user.id,
                        name: 'Default ICP',
                    }
                })
            }
            const constructMessages = this.mapMessagesToLLMMessages([...conversation.messages, {
                role: 'user',
                content: prompt,
            }])

            console.log(constructMessages, icp)
            const llmResponse = await this.httpService.axiosRef.post(
                'http://localhost:8000/icp/generate',
                {
                    messages: constructMessages,
                    icp: icp,
                }
            )

            console.log(llmResponse.data)

            const {ai_response_content, tool_call_args} = llmResponse.data;

            if (tool_call_args !== null) {
                const inputData = ICPSchema.parse(tool_call_args.input_data)
                Object.keys(inputData).forEach((key) => {
                    if (Array.isArray(inputData[key]) && inputData[key].length === 0) {
                        delete inputData[key];
                    }
                });
                await this.prismaService.iCP.update({
                    data: {
                        ...inputData
                    },
                    where: {
                        id: icp.id
                    }
                })
            }

            await Promise.all([
                await this.prismaService.message.create({
                    data: {
                        content: prompt,
                        role: MessageRole.user,
                        conversationId: conversation.id,
                    }
                }),
                await this.prismaService.message.create({
                    data: {
                        content: ai_response_content,
                        role: MessageRole.assistant,
                        conversationId: conversation.id,
                    }
                }),
            ])

            return {
                aiMessage: ai_response_content,
                success: true,
            }
            
        } catch (error) {
            console.error('Error generating ICP:', error.message);
            throw new InternalServerErrorException('Error generating ICP');
        }
    }

    async getIcp(userId: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    icp: true,
                }
            })

            if (!user) {
                throw new BadRequestException('User not found');
            }

            return user.icp
        } catch (error) {
            console.error('Error fetching ICP:', error.message);
            throw new InternalServerErrorException('Error fetching ICP');
        }
    }
    

    async getChats(userId: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    conversation: {
                        include: {
                            messages: true,
                        }
                    }
                }
            })

            if (!user) {
                throw new BadRequestException('User not found');
            }

            return user.conversation.messages
        } catch (error) {
            console.error('Error fetching chats:', error.message);
            throw new InternalServerErrorException('Error fetching chats');
        }
    }
}
