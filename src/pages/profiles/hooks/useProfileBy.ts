import {useEffect, useState} from "react";

import getProfileById from "@/features/profiles/getProfileById.ts";
import getProfileByUsername from "@/features/profiles/getProfileByUsername.ts";
import type {profile} from "@features/profiles/types.ts";

type Params = { id?: string | null; username?: string | null };

export default function useProfileBy({ id, username }: Params) {
    const [data, setData] = useState<profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        setData(null);
        setError(null);
        setStatus(null);

        const key = (id ?? "").trim() || (username ?? "").trim();
        if (!key) return;

        setLoading(true);
        (async () => {
            try {
                const user = id ? await getProfileById(id) : await getProfileByUsername(username!);
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
    }, [id, username]);

    return { data, loading, error, status };
}