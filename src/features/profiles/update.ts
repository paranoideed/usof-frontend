import api from"../api.ts";

export type UpdateMeInput = {
    username?: string;
    pseudonym?: string | null;
};

export type UpdateMeResponse = {
    id: string;
    username: string;
    pseudonym: string | null;
};

export default async function updateMe(input: UpdateMeInput): Promise<UpdateMeResponse> {
    try {
        const { data } = await api.post("/profiles/me", input);
        return data;
    } catch (error: any) {
        if (error.response) throw error;
        throw new Error(error.message || "Network error");
    }
}
