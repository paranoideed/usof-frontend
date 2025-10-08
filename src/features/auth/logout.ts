import Cookies from "js-cookie";
import { api } from "../client";

export default async function logout() {
    try {
        await api.post("/auth/logout");
    } catch {
    } finally {
        Cookies.remove("accessToken");
        Cookies.remove("accessToken", { path: "/" });

        Cookies.remove("token");
        Cookies.remove("token", { path: "/" });
    }
}
