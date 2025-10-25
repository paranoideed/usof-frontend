import api from "@/features/api.ts";
import {getCurrentUserId} from "@features/auth/sessions.ts";

export type ResetPasswordInput = {
    data: {
        id: string;
        type: "reset_password";
        attributes: {
            new_password: string;
        }
    }
}

export async function resetPassword(params: {password: string}): Promise<any> {
    const userId = getCurrentUserId()
    if (!userId) {
        throw new Error("User is not authenticated");
    }

    console.log("Resetting password for user ID:", userId);

    const body: ResetPasswordInput = {
        data: {
            id: userId,
            type: "reset_password",
            attributes: {
                new_password: params.password,
            }
        }
    };

    try {
        const { data } = await api.post('/auth/reset-password', body);

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

