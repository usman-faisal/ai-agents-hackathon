"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Mic, Send, X, User, Bot, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"
import axios from "axios"
import Markdown from 'react-markdown'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ChatSidebar } from "./chat-sidebar"

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
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const API_BASE_URL = "http://localhost:8001/api/v1/icp"

    const { state } = useSidebar()

    // Scroll to bottom of chat messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages])

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputText]);

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
        <div className="flex h-screen w-full">
            <ChatSidebar />
            <div
                className={cn(
                    "flex flex-col h-screen bg-background transition-all duration-300",
                    state === "expanded" ? "w-[100%]" : "w-full",
                )}
            >
                {/* Header */}
                <header className="border-b py-3 px-4 bg-card shadow-sm">
                    <div className=" mx-auto flex items-center justify-between">
                        <div className="flex gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-semibold">Chat Assistant</h1>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={fetchChatHistory} disabled={isLoadingHistory}>
                                        {isLoadingHistory ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Refresh chat history</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </header>

                {/* Chat messages area */}
                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="w-full mx-auto space-y-6 max-w-5xl">
                        {isLoadingHistory && (
                            <div className="flex flex-col justify-center items-center h-64 py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">Loading chat history...</p>
                            </div>
                        )}

                        {!isLoadingHistory && error && messages.length === 0 && (
                            <div className="flex flex-col justify-center items-center h-64 py-12 text-center">
                                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                                <p className="text-lg font-semibold text-destructive">Error</p>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <Button onClick={fetchChatHistory} variant="outline" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {!isLoadingHistory && !error && messages.length === 0 && (
                            <div className="flex flex-col justify-center items-center h-64 py-12 text-center">
                                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                                <p className="text-muted-foreground max-w-md">
                                    Ask a question or share files to begin chatting with the assistant.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                                {msg.role === "assistant" && (
                                    <Avatar className="h-8 w-8 mt-1">
                                        <div className="bg-primary/10 h-full w-full rounded-full flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                    </Avatar>
                                )}

                                <div
                                    className={cn(
                                        "max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl",
                                        "flex flex-col gap-1",
                                        msg.role === "user" ? "items-end" : "items-start",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "px-4 py-3 rounded-2xl shadow-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted rounded-tl-none",
                                        )}
                                    >
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <Markdown>{msg.text}</Markdown>
                                        </div>

                                        {msg.files && msg.files.length > 0 && (
                                            <div className="mt-3 space-y-1.5">
                                                <p className="text-xs font-medium opacity-70">Attachments:</p>
                                                {msg.files.map((file, fileIndex) => (
                                                    <div
                                                        key={fileIndex}
                                                        className={cn(
                                                            "text-xs p-2 rounded-lg flex items-center gap-2",
                                                            msg.role === "user"
                                                                ? "bg-primary-foreground/10 text-primary-foreground"
                                                                : "bg-background border",
                                                        )}
                                                    >
                                                        <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span className="truncate flex-1">{file.name}</span>
                                                        {file.size && (
                                                            <span className="text-xs opacity-75 whitespace-nowrap">
                                                                ({(file.size / 1024).toFixed(1)} KB)
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                                        {msg.role === "user" && msg.status === "sending" && (
                                            <span className="flex items-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Sending...
                                            </span>
                                        )}

                                        {msg.role === "user" && msg.status === "failed" && (
                                            <span className="flex items-center gap-1 text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                Failed to send
                                            </span>
                                        )}

                                        <time dateTime={msg.timestamp}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </time>
                                    </div>
                                </div>

                                {msg.role === "user" && (
                                    <Avatar className="h-8 w-8 mt-1">
                                        <div className="bg-primary h-full w-full rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input area */}
                <div className="border-t bg-card p-3 md:p-4">
                    <div className="max-w-5xl mx-auto">
                        {/* Global error display for sending */}
                        {error && !isSending && messages.some((m) => m.status !== "failed") && (
                            <div className="mb-3 p-2.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                {error}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setError(null)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        )}

                        <div className="rounded-xl border shadow-sm bg-background overflow-hidden">
                            {/* File attachments display */}
                            {inputFiles.length > 0 && (
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-xs font-medium mb-2 text-muted-foreground">Attachments:</p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {inputFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                                                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-50 rounded-full hover:bg-background/50 p-0.5"
                                                    disabled={isSending}
                                                    type="button"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Remove {file.name}</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end p-3">
                                <Textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    placeholder="Type your message..."
                                    className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 py-1 bg-transparent"
                                    disabled={isSending}
                                />
                            </div>

                            <div className="flex items-center px-3 pb-3 pt-1">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isSending}
                                                className="h-9 w-9 rounded-full"
                                            >
                                                <Paperclip className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p>Attach files</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={true}
                                                className="h-9 w-9 rounded-full text-muted-foreground"
                                            >
                                                <Mic className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p>Voice input (coming soon)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <div className="flex-1" />

                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSending || (!inputText.trim() && inputFiles.length === 0)}
                                    className="rounded-full px-4 h-9"
                                    size="sm"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
