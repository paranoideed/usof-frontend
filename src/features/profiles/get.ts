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
        id: data.id ?? data.user_id ?? data.data?.id,
        username: data.username ?? data.login ?? data.data?.attributes?.username,
        pseudonym: data.pseudonym ?? data.data?.attributes?.pseudonym ?? null,
        avatar: data.avatar ?? data.data?.attributes?.avatar ?? null,
        reputation: data.reputation ?? data.data?.attributes?.reputation ?? 0,
        created_at: data.createdAt ?? data.created_at ?? data.data?.attributes?.createdAt,
    };
}

export async function getProfileByUsername(username: string): Promise<Profile> {
    const { data } = await api.get(`/profiles/username/${username}`);
    return {
        id: data.id ?? data.user_id ?? data.data?.id,
        username: data.username ?? data.login ?? data.data?.attributes?.username,
        pseudonym: data.pseudonym ?? data.data?.attributes?.pseudonym ?? null,
        avatar: data.avatar ?? data.data?.attributes?.avatar ?? null,
        reputation: data.reputation ?? data.data?.attributes?.reputation ?? 0,
        created_at: data.createdAt ?? data.created_at ?? data.data?.attributes?.createdAt,
    };
}