import { api } from "../client";
import type {Profile, ProfileList} from "./types.ts";

export type SearchProfilesParams = {
    username: string;
    limit?:   number;
    offset?:  number;
};

export async function list(params: SearchProfilesParams): Promise<ProfileList> {
    const { data } = await api.get(`/profiles`, {
        params: {
            username: params.username,
            limit: params.limit,
            offset: params.offset,
        },
    });

    const srcItems = data.items ?? data.data ?? [];
    const items: Profile[] = srcItems.map((u: any) => ({
        id: u.id ?? u.user_id ?? u.data?.id,
        username: u.username ?? u.login ?? u.data?.attributes?.username,
        pseudonym: u.pseudonym ?? u.data?.attributes?.pseudonym ?? null,
        avatar: u.avatar ?? u.data?.attributes?.avatar ?? null,
    }));

    return {
        items,
        total: data.total ?? data.meta?.total ?? items.length,
        limit: data.limit ?? data.meta?.limit ?? (params.limit ?? 10),
        offset: data.offset ?? data.meta?.offset ?? (params.offset ?? 0),
    };
}
