import api from"../api.ts";

import type {ProfileList} from "./profile.ts";

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

    return data;
}
