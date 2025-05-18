"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Mic, Send, X, User, Bot, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"

// Define the structure of a chat message
interface ChatMessageFile {
    name: string;
    type?: string;
    size?: number;
    url?: string; // Optional: if files are served from a URL after upload
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    files?: ChatMessageFile[];
    timestamp: string;
    status?: "sending" | "failed" | "sent";
}

interface ApiHistoryMessage {
    id: string;
    role: "user" | "assistant";
    content: string; 
    createdAt: string;
}

interface ApiAssistantResponseMessage {
    aiMessage: string
}


export default function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [inputFiles, setInputFiles] = useState<File[]>([])
    
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)

    const API_BASE_URL = "http://localhost:8001/api/v1/icp"

    // Scroll to bottom of chat messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages])

    // Fetch chat history on mount
    const fetchChatHistory = useCallback(async () => {
        setIsLoadingHistory(true)
        setError(null)
        try {
            const response = await axios.get<ApiHistoryMessage[]>(`${API_BASE_URL}/chats`, {
                withCredentials: true,
            })
            const historyMessages: ChatMessage[] = response.data.map((apiMsg) => {
                const role = (apiMsg.role === "user") ? "user" : "assistant";
                return {
                    id: apiMsg.id,
                    role: role,
                    text: apiMsg.content,
                    timestamp: apiMsg.createdAt,
                    status: "sent",
                }
            });
            setMessages(historyMessages)
        } catch (err) {
            console.error("Error fetching chat history:", err)
            setError("Failed to load chat history. Please try again later.")
            setMessages([]) // Clear messages on error or show placeholder
        } finally {
            setIsLoadingHistory(false)
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchChatHistory()
    }, [fetchChatHistory])

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setInputFiles((prev) => [...prev, ...newFiles])
        }
        // Reset file input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Remove a file from the pending list
    const removeFile = (index: number) => {
        setInputFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // Handle form submission
    const handleSubmit = async () => {
        if (!inputText.trim() && inputFiles.length === 0) return

        setIsSending(true)
        setError(null)

        const userMessageId = `user-${Date.now()}`
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: "user",
            text: inputText,
            files: inputFiles.map(file => ({ name: file.name, type: file.type, size: file.size })),
            timestamp: new Date().toISOString(),
            status: "sending",
        }
        setMessages((prev) => [...prev, userMessage])

        const formData = new FormData()
        formData.append("prompt", inputText)
        inputFiles.forEach(file => {
            formData.append("files", file)
        })

        setInputText("")
        setInputFiles([])

        try {
            const response = await axios.post<ApiAssistantResponseMessage>(`${API_BASE_URL}/chat`, formData, {
                withCredentials: true,
            })
            
            // Update user message status to 'sent'
            setMessages(prev => prev.map(msg => 
                msg.id === userMessageId ? { ...msg, status: "sent" } : msg
            ));

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                text: response.data.aiMessage,
                // Assuming API response for new message might not have 'files' in the same way,
                // or if it does, map them here.
                // files: response.data.source_documents?.map(...) // Example if bot can return files
                timestamp: new Date().toISOString(),
                status: "sent",
            }
            setMessages((prev) => [...prev, assistantMessage])

        } catch (err) {
            console.error("Error sending message:", err)
            setError("Failed to send message.")
            setMessages(prev => prev.map(msg => 
                msg.id === userMessageId ? { ...msg, status: "failed" } : msg
            ));
        } finally {
            setIsSending(false)
        }
    }
    
    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSending && (inputText.trim() || inputFiles.length > 0)) {
                handleSubmit();
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Chat messages area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {isLoadingHistory && (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2 text-muted-foreground">Loading chat history...</p>
                    </div>
                )}
                {!isLoadingHistory && error && messages.length === 0 && (
                     <div className="flex flex-col justify-center items-center h-full text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <p className="text-lg font-semibold text-destructive">Error</p>
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={fetchChatHistory} className="mt-4">Try Again</Button>
                    </div>
                )}
                {!isLoadingHistory && !error && messages.length === 0 && (
                     <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl p-3 rounded-lg shadow",
                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <div className="flex items-center mb-1">
                                {msg.role === "user" ? (
                                    <User className="h-5 w-5 mr-2 flex-shrink-0" />
                                ) : (
                                    <Bot className="h-5 w-5 mr-2 flex-shrink-0" />
                                )}
                                <span className="font-semibold text-sm">
                                    {msg.role === "user" ? "You" : "Assistant"}
                                </span>
                                {msg.role === "user" && msg.status === "sending" && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
                                {msg.role === "user" && msg.status === "failed" && <AlertCircle className="h-3 w-3 ml-2 text-destructive" />}
                            </div>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            {msg.files && msg.files.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {msg.files.map((file, index) => (
                                        <div key={index} className={cn(
                                            "text-xs p-1.5 rounded flex items-center gap-1.5",
                                            msg.role === "user" ? "bg-primary-darker text-primary-foreground" : "bg-background border"
                                        )}>
                                            <Paperclip className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                            {file.size && (
                                                <span className="text-xs opacity-75 whitespace-nowrap">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs opacity-60 mt-1.5 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input area */}
            <div className="border-t bg-background p-3 md:p-4">
                 {/* Global error display for sending */}
                 {error && !isSending && messages.some(m=>m.status !== 'failed') && ( // Show global error if not tied to a specific message that failed
                    <div className="mb-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="w-full max-w-3xl mx-auto border rounded-lg shadow-sm bg-card">
                    <div className="p-3">
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleTextareaKeyDown}
                            placeholder="Type your message or drop files..."
                            className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0"
                            disabled={isSending}
                        />
                    </div>

                    {/* File attachments display */}
                    {inputFiles.length > 0 && (
                        <div className="px-3 pb-2">
                            <p className="text-xs font-medium mb-1 text-muted-foreground">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                                {inputFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button 
                                            onClick={() => removeFile(index)} 
                                            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                                            disabled={isSending}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Remove {file.name}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t p-2 flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                            aria-label="Attach files"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>

                        {/* Mic button (non-functional for audio recording as per requirement) */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isSending} // Or true if functionality is not intended
                            aria-label="Record audio (disabled)"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Mic className="h-5 w-5" />
                        </Button>

                        <div className="flex-1" />

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSending || (!inputText.trim() && inputFiles.length === 0)}
                            className="rounded-full px-4"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}