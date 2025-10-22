import api from "@/features/api.ts";

export type ResetPasswordInput = {
    new_password: string;
    new_password_confirm: string;
}

export async function resetPassword(input: ResetPasswordInput): Promise<any> {
    const payload = {
        new_password: input.new_password,
    };

    try {
        const { data } = await api.post('/auth/reset-password', payload);
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

