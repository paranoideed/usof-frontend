import Cookies from "js-cookie";

export type UserRole = "admin" | "user" | string;


function decodeBase64Url(input: string): string {
    // base64url -> base64
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    // add padding if needed
    const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
    const padded = base64 + "=".repeat(pad);
    try {
        return atob(padded);
    } catch {
        return "";
    }
}


export function getAccessToken(): string | null {
    return Cookies.get("token") || null;
}


export function parseJwtPayload<T = any>(token: string | null): T | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        const json = decodeBase64Url(parts[1]);
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}


export function getCurrentUserRole(): UserRole | null {
    const token = getAccessToken();
    const payload = parseJwtPayload<{ role?: UserRole; Role?: UserRole }>(token);
    return payload?.role ?? payload?.Role ?? null;
}

export function getCurrentUserId(): string | null {
    const token = getAccessToken();
    const payload = parseJwtPayload<{ sub?: string; Sub?: string }>(token);
    return payload?.sub ?? payload?.Sub ?? null;
}

export function isAdmin(): boolean {
    console.log("Current user role:", getCurrentUserRole());
    return getCurrentUserRole() === "admin";
}