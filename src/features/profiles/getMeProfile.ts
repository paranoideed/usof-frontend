import { api } from "../client";

export type MeResponse = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
    avatar:     string | null;
    reputation: number;
    created_at:  Date;
    updated_at:  Date | null;
};

export async function getMeProfile(): Promise<MeResponse> {
    try {
        const { data } = await api.get("/profiles/me");
        return data;
    } catch (error: any) {
        if (error.response) {
            throw error;
        } else {
            throw new Error(error.message || "Network error");
        }
    }
}
