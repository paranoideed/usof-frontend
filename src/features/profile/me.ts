import { api } from "../client";

export type MeResponse = {
    id:         string;
    username:   string;
    pseudonym:  string | null;
    avatar:     string | null;
    reputation: number;
    createdAt:  Date;
    updatedAt:  Date | null;
};

export async function fetchMe(): Promise<MeResponse> {
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
