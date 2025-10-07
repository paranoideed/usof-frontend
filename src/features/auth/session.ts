import Cookies from "js-cookie";

function base64urlToJson<T = any>(b64url: string): T | null {
    try {
        const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(b64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

export function getCurrentUserId(): string | null {
    const token = Cookies.get("accessToken") || Cookies.get("token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = base64urlToJson<{ sub?: string; userId?: string; id?: string }>(parts[1]);
    return payload?.sub || payload?.userId || payload?.id || null;
}
