// ai-agents-hackathon-main/client/app/(dashboard)/layout.tsx
import { Header } from "@/components/shared/Header"; // Assuming you have a main header
import Link from "next/link";
import { SidebarProvider } from "@/components/ui/sidebar"; // if chat interface is main

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* You might have a more sophisticated Header/Navbar here */}
            <header className="bg-background border-b p-4">
                <nav className="container mx-auto flex justify-between items-center">
                    <Link href="/dashboard" className="text-xl font-semibold text-primaryCol">
                        AI Agents Dashboard
                    </Link>
                    <div className="space-x-4">
                        <Link href="/dashboard" className="text-foreground hover:text-primaryCol">Chat (ICP)</Link>
                        <Link href="/search-profiles" className="text-foreground hover:text-primaryCol">Search Profiles</Link>
                        {/* Add other dashboard links here */}
                    </div>
                    <div>
                        {/* ProfileButton or other user-specific items */}
                    </div>
                </nav>
            </header>
            <main className="flex-grow">
                {/*
          If ChatInterface is the primary content of /dashboard,
          then SidebarProvider might be specific to that page.
          Otherwise, if SidebarProvider is for a global dashboard sidebar,
          it would wrap `children` here.
        */}
                {children}
            </main>
        </div>
    );
}