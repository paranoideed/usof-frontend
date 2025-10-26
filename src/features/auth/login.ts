import api from "@features/api.ts";
import {saveAvatar, saveUsername} from "@features/auth/sessions.ts";
import Cookies from "js-cookie";

export type LoginResponse = {
    data: {
        id: string;
        type: "login"
        attributes: {
            token:      string;
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: string;
            updated_at: string | null;
        }
    }
};

export type LoginInput = {
    data: {
        type: "login",
        attributes: {
            email?: string;
            username?: string;
            password: string;
        }
    }
};

function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
}

export default async function login(params: { identifier: string; password: string }): Promise<LoginResponse> {
    const body: LoginInput = {
        data: {
            type: "login",
            attributes: { password: params.password },
        },
    };

    if (isEmail(params.identifier)) {
        body.data.attributes.email = params.identifier;
    } else {
        body.data.attributes.username = params.identifier;
    }

    try {
        const res = await api.post<LoginResponse>("/auth/login", body);

        const payload: LoginResponse = res.data;

        const attrs = payload.data.attributes;

        console.log("Login payload:", attrs);

        saveAvatar(attrs.avatar_url ?? null);
        saveUsername(attrs.username);

        Cookies.set("token", attrs.token, {
            expires: 7,
            sameSite: "lax",
            secure: window.location.protocol === "https:",
        });

        return payload;
    } catch (error: any) {
        if (error?.response) {
            console.error("error: ", error.response.data);
            console.error("status: ", error.response.status);
        } else {
            console.error("Internal network error or axios error:", error?.message);
        }
        throw error;
    }
}