import * as React from "react";
import { useEffect, useState } from "react";

import { getMeProfile, type MeResponse } from "@features/profiles/get.ts";

export default function useProfile() {
    const [data, setData] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        setStatus(null);

        (async () => {
            try {
                const me = await getMeProfile();
                if (!alive) return;
                setData(me);
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
    }, []);

    return { data, loading, error, status, setData } as {
        data: MeResponse | null;
        loading: boolean;
        error: string | null;
        status: number | null;
        setData: React.Dispatch<React.SetStateAction<MeResponse | null>>;
    };
}

