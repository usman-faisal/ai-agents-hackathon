"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Mic, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatInput() {
    const [text, setText] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [recordingError, setRecordingError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    // Remove a file from the list
    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // Handle voice recording
    const startRecording = async () => {
        try {
            setRecordingError(null)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
                setAudioBlob(audioBlob)

                // Stop all tracks in the stream
                stream.getTracks().forEach((track) => track.stop())
            }

            // Start recording
            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (error) {
            console.error("Error starting recording:", error)
            setRecordingError("Could not access microphone. Please check permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)

            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setAudioBlob(null)

            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }

    const removeAudio = () => {
        setAudioBlob(null)
    }

    // Format recording time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Handle form submission
    const handleSubmit = async() => {
        // Here you would typically send the data to your backend
        console.log({
            text,
            files,
            audioBlob,
        })

        const formData = new FormData();

        // Append the file to the FormData
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }

        // Append the prompt text
        formData.append('prompt', text);

        try {
            const response = await fetch('http://localhost:8000/api/v1/icp/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.log(response)
                throw new Error(`Error: ${response.status}`);
            }

            setText("")
            setFiles([])
            setAudioBlob(null)
            return await response.json();
        } catch (error) {
            console.error('Error uploading to ICP API:', error);
            throw error;
        }
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    return (
        <div className="w-full max-w-2xl mx-auto border rounded-lg shadow-sm">
            {/* Text input area */}
            <div className="p-4">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[100px] resize-none"
                />
            </div>

            {/* File attachments display */}
            {files.length > 0 && (
                <div className="px-4 pb-2">
                    <p className="text-sm font-medium mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {file.name}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Audio recording display */}
            {audioBlob && !isRecording && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <Mic className="h-4 w-4 text-rose-500" />
                            <span>Audio recording ({formatTime(recordingTime)})</span>
                            <button onClick={removeAudio} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove audio</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recording error message */}
            {recordingError && (
                <div className="px-4 pb-2">
                    <p className="text-sm text-red-500">{recordingError}</p>
                </div>
            )}

            {/* Input controls */}
            <div className="border-t p-2 flex items-center gap-2">
                {/* File attachment button */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording}
                >
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach files</span>
                </Button>

                {/* Voice recording button */}
                {isRecording ? (
                    <div className="flex items-center gap-2">
                        <div className="text-rose-500 text-sm font-medium animate-pulse flex items-center gap-1">
                            <span>Recording</span>
                            <span>{formatTime(recordingTime)}</span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={stopRecording}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            Stop
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelRecording}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={startRecording}
                        className={cn(
                            "text-muted-foreground hover:text-foreground",
                            audioBlob && "text-rose-500 hover:text-rose-600",
                        )}
                    >
                        <Mic className="h-5 w-5" />
                        <span className="sr-only">Record audio</span>
                    </Button>
                )}

                <div className="flex-1" />

                {/* Send button */}
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isRecording || (!text && files.length === 0 && !audioBlob)}
                    className="rounded-full px-4"
                >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                </Button>
            </div>
        </div>
    )
}
