// useMeProfile.ts
import * as React from "react";
import { getMeProfile } from "@features/profiles/get";
import type { Profile } from "@features/profiles/profile.ts";

export default function useMeProfile(): {
    data: Profile | null;
    loading: boolean;
    error: string | null;
    status: number | null;
    setData: React.Dispatch<React.SetStateAction<Profile | null>>;
    reload: () => Promise<void>;               // <-- добавить в тип
} {
    const [data, setData] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<number | null>(null);

    const reload = React.useCallback(async () => { // <-- добавить функцию
        setLoading(true);
        setError(null);
        setStatus(null);
        try {
            const me = await getMeProfile();
            setData(me);
        } catch (err: any) {
            setStatus(err?.response?.status ?? null);
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to load profiles"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError(null);
            setStatus(null);
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

    return { data, loading, error, status, setData, reload }; // <-- вернуть reload
}
