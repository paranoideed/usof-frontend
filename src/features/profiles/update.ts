import api from"../api.ts";
import {getCurrentUserId, saveUsername} from "@features/auth/sessions.ts";
import type {Profile} from "@features/profiles/profile.ts";

export type UpdateMeInput = {
    data: {
        id: string;
        type: "profile";
        attributes: {
            username?: string;
            pseudonym?: string | null;
        };
    };
};

export default async function updateMe(input: {
    username?: string;
    pseudonym?: string | null;
}): Promise<Profile> {
    try {
        const { data } = await api.post("/profiles/me", {
            data: {
                id: getCurrentUserId(),
                type: "profile",
                attributes: {
                    username: input.username,
                    pseudonym: input.pseudonym,
                },
            },
        });

        if (input.username) {
            saveUsername(input.username);
        }

        return data;
    } catch (error: any) {
        if (error.response) throw error;
        throw new Error(error.message || "Network error");
    }
}

