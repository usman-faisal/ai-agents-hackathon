import { Heading } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatInterface from "./components/chat-interface";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
    return (
        <div className={cn("flex flex-col items-center justify-center w-full   min-h-screen gap-9")}>
            <SidebarProvider defaultOpen={true}>
                <ChatInterface />
            </SidebarProvider>
        </div>
    );
}
