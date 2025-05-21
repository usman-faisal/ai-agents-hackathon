// ai-agents-hackathon-main/client/API/search.api.ts
import api from "./middleware";
import { IcpDataForAgentDto, ProfileDto } from "@/types/agent-types"; // We'll define this next

export interface SearchProfilesRequest {
    icpData?: IcpDataForAgentDto; // Optional: to override user's default ICP
}

export interface SearchProfilesResponse {
    found_profiles: ProfileDto[];
    message?: string;
}

export const findProfiles = async (
    payload: SearchProfilesRequest,
): Promise<{ success: boolean; response: SearchProfilesResponse | string }> => {
    try {
        const { data } = await api.post<SearchProfilesResponse>(
            "/search/find-profiles", // This matches the NestJS endpoint
            payload,
        );

        // Assuming your NestJS backend returns the data directly without a 'success' wrapper
        // If it does wrap with success, adjust accordingly like in auth.api.ts
        return {
            success: true,
            response: data,
        };
    } catch (error: any) {
        return {
            success: false,
            response: error.response?.data?.message || error.message || "Failed to find profiles",
        };
    }
};