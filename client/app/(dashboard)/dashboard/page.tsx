import {Heading} from "lucide-react";
import ChatInput from "@/app/(dashboard)/dashboard/components/chat-input";
import {cn} from "@/lib/utils";

export default function Home() {
    return (
        <div className={cn("flex flex-col items-center justify-center w-full max-w-2xl mx-auto min-h-screen gap-9")}>
            <h1  className={cn("text-6xl font-bold")}>Hello world</h1>
            <ChatInput />
        </div>
    );
}
