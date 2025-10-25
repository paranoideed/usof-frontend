import api from "@features/api.ts";
import {saveAvatar, saveUsername} from "@features/auth/sessions.ts";

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
            created_at: Date;
            updated_at: Date | null;
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

export default async function login(params: {identifier: string, password: string}): Promise<LoginResponse> {
    let body: LoginInput = {
        data: {
            type: "login",
            attributes: {
                password: params.password,
            }
        }
    };

    if (isEmail(params.identifier)) {
        body.data.attributes.email = params.identifier;
    } else {
        body.data.attributes.email = params.identifier;
    }

    try {
        const responseData: LoginResponse = await api.post('/auth/login', body);

        saveAvatar(responseData.data.attributes.avatar_url);
        saveUsername(responseData.data.attributes.username);

        return responseData;
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