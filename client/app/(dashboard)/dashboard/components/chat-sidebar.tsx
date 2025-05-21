"use client"

import { useEffect, useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarTrigger,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, Edit, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
import * as crypto from "crypto"

interface FieldValue {
    id: string
    value: string
    isEditing?: boolean
}

interface Field {
    id: string
    name: string
    values: FieldValue[]
}

export function ChatSidebar() {
    const [fields, setFields] = useState<Field[]>([
        {
            id: "location",
            name: "Location",
            values: [
                { id: "1", value: "karachi, pakistan" },
                { id: "2", value: "lahore, pakistan" },
            ],
        },
        {
            id: "interests",
            name: "Interests",
            values: [
                { id: "3", value: "technology" },
                { id: "4", value: "design" },
            ],
        },
    ])

    const [newValue, setNewValue] = useState<string>("")
    const [activeField, setActiveField] = useState<string | null>(null)

    useEffect(() => {

        (async () => {
            const API_BASE_URL = "http://localhost:8001/api/v1/icp"
            const excludedFields = ["name", "createdAt", "userId", "id", "updatedAt", "isActive", "description"]
            const response = await axios.get(`${API_BASE_URL}`, {
                withCredentials: true
            })

            const fieldsFromApi: Field[] = [];

            for (const field of Object.keys(response.data)) {

                if(!excludedFields.includes(field) && response.data[field].length !== 0) {
                    const f: Field = {
                        id: field,
                        name: field,
                        values: response.data[field].map((item: any, index: number)  => ({
                            id: item,
                            value: item,
                            isEditing: false,
                        }))
                    }
                    fieldsFromApi.push(f)
                }
            }
            console.log(fieldsFromApi)
            setFields(fieldsFromApi)
        })()


    }, [])

    const handleAddValue = async (fieldId: string) => {
        if (!newValue.trim()) return

        // In a real app, you would call your API here
        try {
            // Simulate API call
            // const response = await axios.post('/api/fields/values', { fieldId, value: newValue })

            // Add the new value to the state
            setFields((prevFields) =>
                prevFields.map((field) =>
                    field.id === fieldId
                        ? {
                            ...field,
                            values: [...field.values, { id: `new-${Date.now()}`, value: newValue }],
                        }
                        : field,
                ),
            )

            // Clear the input
            setNewValue("")
            setActiveField(null)
        } catch (error) {
            console.error("Failed to add value:", error)
        }
    }

    const handleDeleteValue = async (fieldId: string, valueId: string) => {
        try {
            // Simulate API call
            // await axios.delete(`/api/fields/values/${valueId}`)

            // Remove the value from the state
            setFields((prevFields) =>
                prevFields.map((field) =>
                    field.id === fieldId
                        ? {
                            ...field,
                            values: field.values.filter((v) => v.id !== valueId),
                        }
                        : field,
                ),
            )
        } catch (error) {
            console.error("Failed to delete value:", error)
        }
    }

    const startEditing = (fieldId: string, valueId: string) => {
        setFields((prevFields) =>
            prevFields.map((field) =>
                field.id === fieldId
                    ? {
                        ...field,
                        values: field.values.map((v) => (v.id === valueId ? { ...v, isEditing: true } : v)),
                    }
                    : field,
            ),
        )
    }

    const handleUpdateValue = async (fieldId: string, valueId: string, newValue: string) => {
        try {
            // Simulate API call
            // await axios.put(`/api/fields/values/${valueId}`, { value: newValue })

            setFields((prevFields) =>
                prevFields.map((field) =>
                    field.id === fieldId
                        ? {
                            ...field,
                            values: field.values.map((v) =>
                                v.id === valueId ? { id: v.id, value: newValue, isEditing: false } : v,
                            ),
                        }
                        : field,
                ),
            )
        } catch (error) {
            console.error("Failed to update value:", error)
        }
    }

    const handleEditChange = (fieldId: string, valueId: string, newValue: string) => {
        setFields((prevFields) =>
            prevFields.map((field) =>
                field.id === fieldId
                    ? {
                        ...field,
                        values: field.values.map((v) => (v.id === valueId ? { ...v, value: newValue } : v)),
                    }
                    : field,
            ),
        )
    }

    return (
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
            <SidebarHeader className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold">ICP</h2>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <ScrollArea className="h-full">
                    {fields.map((field) => (
                        <SidebarGroup key={field.id} className="px-3 py-2">
                            <SidebarGroupLabel className="flex items-center justify-between mb-2">
                                <span>{field.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setActiveField(activeField === field.id ? null : field.id)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <div className="space-y-2">
                                    {field.values.map((value) => (
                                        <div
                                            key={value.id}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-md bg-muted/50 group",
                                                value.isEditing && "bg-muted",
                                            )}
                                        >
                                            {value.isEditing ? (
                                                <>
                                                    <Input
                                                        value={value.value}
                                                        onChange={(e) => handleEditChange(field.id, value.id, e.target.value)}
                                                        className="h-7 text-sm flex-1"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0"
                                                        onClick={() => handleUpdateValue(field.id, value.id, value.value)}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-sm flex-1 truncate">{value.value}</span>
                                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0"
                                                            onClick={() => startEditing(field.id, value.id)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0 text-destructive"
                                                            onClick={() => handleDeleteValue(field.id, value.id)}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {activeField === field.id && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                                placeholder={`Add new ${field.name.toLowerCase()}`}
                                                className="h-8 text-sm flex-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleAddValue(field.id)
                                                    }
                                                }}
                                            />
                                            <Button size="sm" className="h-8" onClick={() => handleAddValue(field.id)}>
                                                Add
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </ScrollArea>
            </SidebarContent>
        </Sidebar>
    )
}
