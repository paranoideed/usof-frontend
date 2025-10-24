import api from "@features/api.ts";
import type {Profile} from "@features/profiles/types.ts";
import {saveAvatar, saveUsername} from "@features/auth/sessions.ts";

export type UserToken = {
    profile: Profile;
    token: string
};

export type LoginInput = {
    identifier: string;
    password: string;
};

function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
}

export default async function login(input: LoginInput): Promise<UserToken> {
    const { identifier, password } = input;

    const payload: Record<string, string> = { password };
    if (isEmail(identifier)) {
        payload.email = identifier;
    } else {
        payload.username = identifier;
    }

    try {
        const { data } = await api.post('/auth/login', payload);
        console.log("success: ", data);

        console.log(data);

        saveAvatar(data.avatar_url);
        saveUsername(data.username);

        return data;
    } catch (error: any) {
        if (error.response) {
            console.error("error: ", error.response.data);
            console.error("status: ", error.response.status);
        } else {
            console.error("Internal network error or axios error:", error.message);
        }
        throw error;
    }
}