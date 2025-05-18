import {Heading} from "lucide-react";
import {cn} from "@/lib/utils";
import ChatInterface from "./components/chat-interface";

export default function Home() {
    return (
        <div className={cn("flex flex-col items-center justify-center w-full max-w-2xl mx-auto min-h-screen gap-9")}>
            <ChatInterface />
        </div>
    );
}
