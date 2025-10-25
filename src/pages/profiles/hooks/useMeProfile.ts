import * as React from "react";
import { useEffect, useState } from "react";

import { getMeProfile } from "@features/profiles/get.ts";
import type {Profile} from "@features/profiles/types.ts";

export default function useMeProfile() : {
    data:    Profile | null;
    loading: boolean;
    error:   string | null;
    status:  number | null;
    setData: React.Dispatch<React.SetStateAction<Profile | null>>;
} {
    const [data, setData] = useState<Profile | null>(null);
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

    console.log("useMeProfile:", { data, loading, error, status });

    return { data, loading, error, status, setData } as {
        data: Profile | null;
        loading: boolean;
        error: string | null;
        status: number | null;
        setData: React.Dispatch<React.SetStateAction<Profile | null>>;
    };
}

