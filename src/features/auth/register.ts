import {api} from "../client.ts";

export type RegisterInput = {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

export async function register(input: RegisterInput): Promise<any> {
    const payload = {
        email: input.email,
        username: input.username,
        password: input.password,
    };

    try {
        const { data } = await api.post('/auth/register', payload);
        console.log("success: ", data);
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
