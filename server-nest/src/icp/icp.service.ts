import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { MulterFile } from '../common/types/type';
import { Message as PrismaMessage, ICP, MessageRole, Conversation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

import { HttpService } from '@nestjs/axios';
import { ICPSchema } from './dto/llm-icp-structure';

interface PyTextContent {
    type: "text";
    text: string;
}

interface PyFileContent {
    type: "file";
    source_type: "base64";
    data: string;
    mime_type: string;
}

type PyContentType = PyTextContent | PyFileContent;

interface PyMessage {
    role: MessageRole; // Or string 'user', 'assistant'
    content: string | PyContentType[];
}

@Injectable()
export class IcpService {
    constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService) { }

    private mapPrismaMessagesToPyMessages(prismaMessages: Partial<PrismaMessage>[]): PyMessage[] {
        return prismaMessages.map((message) => {
            if (typeof message.content !== 'string') {
                console.warn(`Prisma message content is not a string: ${typeof message.content}. Skipping or erroring.`);
                throw new InternalServerErrorException("Unsupported Prisma message content type for history.")
            }
            return {
                content: message.content,
                role: message.role as MessageRole, // Ensure MessageRole from Prisma is compatible
            };
        });
    }

    async chatIcp(userId: string, prompt: string, files: MulterFile[]) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id: userId },
                include: {
                    icp: true,
                    conversation: {
                        include: {
                            messages: { orderBy: { createdAt: 'asc' } },
                        },
                    },
                },
            });

            if (!user) {
                throw new BadRequestException("User not found");
            }

            let conversation = user.conversation;
            let icp = user.icp;

            if (!conversation) {
                conversation = await this.prismaService.conversation.create({
                    data: { userId: user.id },
                    include: { messages: true },
                });
            }
            if (!icp) {
                icp = await this.prismaService.iCP.create({
                    data: { userId: user.id, name: 'Default ICP' },
                });
            }

            const historicalPyMessages: PyMessage[] = this.mapPrismaMessagesToPyMessages(conversation.messages);

            const currentUserContentParts: PyContentType[] = [];

            if (prompt && prompt.trim() !== "") {
                currentUserContentParts.push({
                    type: 'text',
                    text: prompt,
                });
            }

            if (files && files.length > 0) {
                for (const file of files) {
                    const base64Data = file.buffer.toString('base64');
                    currentUserContentParts.push({
                        type: 'file',
                        source_type: 'base64',
                        data: base64Data,
                        mime_type: file.mimetype,
                    });
                }
            }

            if (currentUserContentParts.length === 0) {
                throw new BadRequestException("Prompt or files must be provided.")
            }

            const currentUserPyMessage: PyMessage = {
                role: MessageRole.user, // Assuming MessageRole.user is 'user'
                content: currentUserContentParts,
            };

            const messagesForPython: PyMessage[] = [...historicalPyMessages, currentUserPyMessage];

            console.log("Sending to Python:", JSON.stringify({ messages: messagesForPython, icp }, null, 2)); // For debugging

            const llmResponse = await this.httpService.axiosRef.post(
                'http://localhost:8000/icp/generate', // Your Python service endpoint
                {
                    messages: messagesForPython,
                    icpData: icp, // Ensure your Python service expects 'icpData'
                                  // or change this key to 'icp' if that's what Python expects
                }
            );

            console.log("LLM Response from Python:", llmResponse.data);

            const { ai_response_content, tool_call_args } = llmResponse.data;

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
            
            await this.prismaService.message.createMany({
                data: [
                    {
                        content: prompt, // Or a serialized version of currentUserPyMessage.content
                        role: MessageRole.user,
                        conversationId: conversation.id,
                        // If you want to store files, you'd need a different schema or link to a file table
                    },
                    {
                        content: ai_response_content, // This is expected to be a string
                        role: MessageRole.assistant,
                        conversationId: conversation.id,
                    },
                ]
            });


            return {
                aiMessage: ai_response_content,
                success: true,
            };

        } catch (error) {
            console.error('Error in chatIcp:', error.response?.data || error.message, error.stack);
            if (error instanceof BadRequestException) throw error;
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
