import Cookies from "js-cookie";

export type UserRole = "admin" | "user" | string;

function decodeBase64Url(input: string): string {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
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

export function saveUsername(username: string): void {
    try {
        localStorage.setItem("username", username);
    } catch (e) {
        console.error("Could not save username to localStorage", e);
    }
}

export function getUsername(): string | null {
    try {
        return localStorage.getItem("username");
    } catch (e) {
        console.error("Could not retrieve username from localStorage", e);
        return null;
    }
}

export function saveAvatar(avatarUrl: string): void {
    try {
        localStorage.setItem("avatar_url", avatarUrl);
    } catch (e) {
        console.error("Could not save avatar URL to localStorage", e);
    }
}

export function getAvatar(): string | null {
    try {
        return localStorage.getItem("avatar_url");
    } catch (e) {
        console.error("Could not retrieve avatar URL from localStorage", e);
        return null;
    }
}

