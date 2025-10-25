import Cookies from "js-cookie";
import api from "@/features/api.ts";
import {clearSession} from "@features/auth/sessions.ts";

export default async function logout(): Promise<void> {
    try {
        await api.post("/auth/logout");
    } catch {
    } finally {
        Cookies.remove("accessToken");
        Cookies.remove("accessToken", { path: "/" });

        Cookies.remove("token");
        Cookies.remove("token", { path: "/" });

        clearSession();
    }
}
