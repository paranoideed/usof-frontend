import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { listPosts, type ListPostsParams, type Post } from "@/features/posts/posts";

type UsePostsFeedOpts = {
    pageSize?: number;
    baseFilters?: Omit<ListPostsParams, "offset" | "limit">;
};

export default function usePostsFeed(opts: UsePostsFeedOpts = {}) {
    const pageSize = opts.pageSize ?? 10;

    // Текущие фильтры держим в ref, чтобы коллбеки были стабильными
    const baseRef = useRef<Omit<ListPostsParams, "offset" | "limit">>(
        opts.baseFilters ?? { order_by: "rating", order_dir: "desc" }
    );
    // Обновляем ref при изменении входных фильтров (глубоко: через stringify)
    const baseStr = JSON.stringify(opts.baseFilters ?? { order_by: "rating", order_dir: "desc" });
    useEffect(() => {
        baseRef.current = JSON.parse(baseStr);
    }, [baseStr]);

    const [items, setItems] = useState<Post[]>([]);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const inFlight = useRef(false); // защита от параллельных вызовов

    const hasMore = useMemo(() => {
        if (total === null) return true;         // пока не знаем total — считаем что ещё есть
        return items.length < total;
    }, [items.length, total]);

    const loadFirstPage = useCallback(async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setLoading(true);
        setErr(null);
        try {
            const data = await listPosts({ ...baseRef.current, offset: 0, limit: pageSize });
            setItems(data.posts);
            setTotal(data.pagination.total);
            setOffset(data.posts.length);
        } catch (e: any) {
            setErr(e?.response?.data?.error || e?.message || "Failed to load");
        } finally {
            inFlight.current = false;
            setLoading(false);
        }
    }, [pageSize]);

    const reload = useCallback(() => {
        // полный сброс + свежая первая страница с актуальными фильтрами из baseRef
        setItems([]);
        setOffset(0);
        setTotal(null);
        setErr(null);
        void loadFirstPage();
    }, [loadFirstPage]);

    const loadMore = useCallback(async () => {
        if (inFlight.current) return;
        if (total !== null && offset >= total) return;

        inFlight.current = true;
        setLoading(true);
        setErr(null);
        try {
            const data = await listPosts({ ...baseRef.current, offset, limit: pageSize });

            setItems(prev => {
                const map = new Map(prev.map(p => [p.data.id, p]));
                for (const it of data.posts) map.set(it.data.id, it);
                return Array.from(map.values());
            });

            setTotal(data.pagination.total);
            setOffset(prev => prev + data.posts.length);
        } catch (e: any) {
            setErr(e?.response?.data?.error || e?.message || "Failed to load");
        } finally {
            inFlight.current = false;
            setLoading(false);
        }
    }, [offset, pageSize, total]);

    // Первая загрузка — один раз
    useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    return { items, loading, err, hasMore, loadMore, reload };
}
