import api from"../api.ts";

import type {Profile} from "@features/profiles/types.ts";

export async function getMeProfile(): Promise<Profile> {
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

export async function getProfileById(userId: string): Promise<Profile> {
    const { data } = await api.get(`/profiles/id/${userId}`);
    return {
        id: data.id ?? data.user_id,
        username: data.username,
        pseudonym: data.pseudonym ?? null,
        avatar_url: data.avatar_url ?? null,
        reputation: data.reputation ?? 0,
        created_at: data.created_at
    };
}

export async function getProfileByUsername(username: string): Promise<Profile> {
    const { data } = await api.get(`/profiles/username/${username}`);
    return {
        id: data.id ?? data.user_id,
        username: data.username,
        pseudonym: data.pseudonym ?? null,
        avatar_url: data.avatar_url ?? null,
        reputation: data.reputation ?? 0,
        created_at: data.created_at
    };
}