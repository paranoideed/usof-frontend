// src/features/profile/update.ts
import { api } from "../client";

export type UpdateMeInput = {
    username?: string;
    pseudonym?: string | null;
};

export type UpdateMeResponse = {
    id: string;
    username: string;
    pseudonym: string | null;
    // остальные поля по желанию — под твой бэк
};

export async function updateMe(input: UpdateMeInput): Promise<UpdateMeResponse> {
    try {
        // если у тебя эндпоинт в единственном числе — поменяй на /profile/me
        const { data } = await api.post("/profiles/me", input);
        return data;
    } catch (error: any) {
        if (error.response) throw error;
        throw new Error(error.message || "Network error");
    }
}
