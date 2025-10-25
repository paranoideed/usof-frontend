import api from"../api.ts";

import type {Profile} from "@features/profiles/profile.ts";

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
    return data
}

export async function getProfileByUsername(username: string): Promise<Profile> {
    const { data } = await api.get(`/profiles/username/${username}`);
    return data
}