import { useEffect, useMemo, useState } from "react";
import { searchProfiles, type SearchProfilesResponse } from "@/features/profiles/searchProfiles.ts";

function useDebounced<T>(value: T, delay = 350): T {
    const [v, setV] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setV(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return v;
}

export default function useProfilesSearch(initialQ = "", initialLimit = 10) {
    const [q, setQ] = useState(initialQ);
    const [limit, setLimit] = useState(initialLimit);
    const [offset, setOffset] = useState(0);

    const dq = useDebounced(q, 350);

    const [data, setData] = useState<SearchProfilesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        if (!dq.trim()) {
            setData({ items: [], total: 0, limit, offset: 0 });
            setErr(null);
            return;
        }

        setLoading(true);
        setErr(null);

        (async () => {
            try {
                const res = await searchProfiles({ username: dq.trim(), limit, offset });
                if (!alive) return;
                setData(res);
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Search failed");
            } finally {
                alive && setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [dq, limit, offset]);

    const hasMore = useMemo(() => {
        if (!data) return false;
        return data.offset + data.limit < data.total;
    }, [data]);

    useEffect(() => {
        setOffset(0);
    }, [dq, limit]);

    return {
        q, setQ,
        limit, setLimit,
        offset, setOffset,
        data, loading, err, hasMore,
    };
}
