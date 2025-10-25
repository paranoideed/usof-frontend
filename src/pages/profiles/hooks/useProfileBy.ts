import {useEffect, useState} from "react";

import type {Profile} from "@features/profiles/profile.ts";
import {getProfileById, getProfileByUsername} from "@features/profiles/get.ts";

export default function useProfileBy(userId?: string, username?: string) : {
    data:    Profile | null;
    loading: boolean;
    error:   string | null;
    status:  number | null;
} {
    const [data, setData] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        setData(null);
        setError(null);
        setStatus(null);

        const key = (userId ?? "").trim() || (username ?? "").trim();
        if (!key) return;

        setLoading(true);
        (async () => {
            try {
                const user = userId ? await getProfileById(userId) : await getProfileByUsername(username!);
                if (!alive) return;
                setData(user);
            } catch (err: any) {
                if (!alive) return;
                setStatus(err?.response?.status ?? null);
                setError(
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Failed to load profiles"
                );
            } finally {
                alive && setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [userId, username]);

    return { data, loading, error, status };
}