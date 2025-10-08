import {api} from "../client.ts";
import type {profile} from "./types.ts";

export default async function getProfileById(userId: string): Promise<profile> {
    const { data } = await api.get(`/profiles/id/${userId}`);
    return {
        id: data.id ?? data.user_id ?? data.data?.id,
        username: data.username ?? data.login ?? data.data?.attributes?.username,
        pseudonym: data.pseudonym ?? data.data?.attributes?.pseudonym ?? null,
        avatar: data.avatar ?? data.data?.attributes?.avatar ?? null,
        reputation: data.reputation ?? data.data?.attributes?.reputation ?? 0,
        createdAt: data.createdAt ?? data.created_at ?? data.data?.attributes?.createdAt,
    };
}