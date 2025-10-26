import api from "@/features/api.ts";

export type RegisterInput = {
    data: {
        type: "register";
        attributes: {
            username: string;
            email: string;
            password: string;
        };
    }
};

export async function register(params: {email: string, username: string, password: string}): Promise<any> {
    const body: RegisterInput = {
        data: {
            type: "register",
            attributes: {
                email: params.email,
                username: params.username,
                password: params.password,
            }
        }
    }

    try {
        const { data } = await api.post('/auth/register', body);

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

export type RegisterByAdminInput = {
    data: {
        type: "register";
        attributes: {
            username: string;
            email: string;
            password: string;
            role: 'user' | 'admin';
        };
    }
};

export async function registerByAdmin(params: {
    email: string,
    username: string,
    password: string,
    role: 'user' | 'admin',
}): Promise<any> {
    const payload: RegisterByAdminInput = {
        data: {
            type: "register",
            attributes: {
                email: params.email,
                username: params.username,
                password: params.password,
                role: params.role,
            }
        }
    };

    try {
        const { data } = await api.post('/auth/admin/register', payload);
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
