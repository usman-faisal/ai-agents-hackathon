// ai-agents-hackathon-main/client/app/(dashboard)/search-profiles/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { findProfiles, SearchProfilesRequest, SearchProfilesResponse } from "@/API/search.api"; // Updated import
import { ProfileDto } from "@/types/agent-types"; // Updated import
import { Loader2, SearchIcon, UserCircle, Building, MapPin, Briefcase, FileText } from "lucide-react";

export default function SearchProfilesPage() {
    const [foundProfiles, setFoundProfiles] = useState<ProfileDto[]>([]);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);

    const { mutateAsync: triggerSearch, isPending: isSearching } = useMutation<
        { success: boolean; response: SearchProfilesResponse | string },
        Error,
        SearchProfilesRequest // Payload type
    >({
        mutationFn: findProfiles,
        onSuccess: (data) => {
            if (data.success && typeof data.response !== 'string') {
                setFoundProfiles(data.response.found_profiles);
                setSearchMessage(data.response.message || (data.response.found_profiles.length > 0 ? "Search successful!" : "No profiles found matching your criteria."));
                if (data.response.found_profiles.length > 0) {
                    toast.success(data.response.message || "Profiles found!");
                } else {
                    toast.info(data.response.message || "No profiles found.");
                }
            } else {
                const errorMessage = typeof data.response === 'string' ? data.response : "Search failed. Please try again.";
                toast.error(errorMessage);
                setSearchMessage(errorMessage);
                setFoundProfiles([]);
            }
        },
        onError: (error) => {
            toast.error(error.message || "An unexpected error occurred during search.");
            setSearchMessage(error.message || "An unexpected error occurred.");
            setFoundProfiles([]);
        },
    });

    const handleSearch = async () => {
        setFoundProfiles([]); // Clear previous results
        setSearchMessage("Searching for profiles...");
        // For now, we are not sending any override ICP data.
        // The backend will use the user's saved ICP.
        // If you want to allow overriding ICP from the frontend,
        // you'd add a form here to collect IcpDataForAgentDto
        // and pass it in the payload.
        await triggerSearch({}); // Empty object means use default ICP on backend
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <SearchIcon className="mr-2 h-6 w-6" />
                        Find Profiles
                    </CardTitle>
                    <CardDescription>
                        Click the button below to search for profiles based on your saved Ideal Customer Profile (ICP).
                        The system will use your current ICP stored in the backend.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSearch} disabled={isSearching} size="lg">
                        {isSearching ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <SearchIcon className="mr-2 h-5 w-5" />
                                Search for Profiles
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {searchMessage && !isSearching && (
                <div className={`p-4 mb-6 rounded-md text-sm ${foundProfiles.length > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {searchMessage}
                </div>
            )}

            {foundProfiles.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Found Profiles ({foundProfiles.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {foundProfiles.map((profile, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <UserCircle className="mr-2 h-5 w-5 text-primaryCol" />
                                        {profile.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center text-sm">
                                        <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> {profile.title}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{profile.company}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{profile.location}</span>
                                    </div>
                                    {profile.industry && (
                                        <div className="flex items-center">
                                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Industry: {profile.industry}</span>
                                        </div>
                                    )}
                                    {profile.summary && (
                                        <div className="pt-2">
                                            <p className="text-xs text-muted-foreground font-medium mb-1">Summary:</p>
                                            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                                                <FileText className="inline mr-1 h-3 w-3 text-muted-foreground" />
                                                {profile.summary}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}