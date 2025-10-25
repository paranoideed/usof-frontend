import * as React from "react";
import { listCategories } from "@features/categories/list";
import type { Category } from "@features/categories/category";

export default function useCategoriesFeed(pageSize = 20) {
    const [all, setAll] = React.useState<Category[]>([]);
    const [visible, setVisible] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await listCategories({ offset: 0, limit: pageSize });
                if (!mounted) return;

                const items: Category[] = (res.data ?? []).map((d) => ({ data: d }));
                const total = res.meta?.total ?? items.length;

                setAll(items);
                setVisible(items.slice(0, Math.min(items.length, pageSize)));
                setHasMore(total > pageSize);
            } catch (e: any) {
                if (mounted) setError(e?.message || String(e));
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [pageSize]);

    const loadMore = React.useCallback(async () => {
        if (loading) return;

        if (all.length > visible.length) {
            const nextVisible = all.slice(0, visible.length + pageSize);
            setVisible(nextVisible);
            setHasMore(all.length > nextVisible.length);
            return;
        }

        setLoading(true);
        try {
            const res = await listCategories({ offset: visible.length, limit: pageSize });
            const newItems: Category[] = (res.data ?? []).map((d) => ({ data: d }));

            const next = [...visible, ...newItems];
            setAll((prev) => [...prev, ...newItems]);
            setVisible(next);

            const total = res.meta?.total ?? next.length;
            setHasMore(total > next.length);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    }, [all, visible, pageSize, loading]);

    const removeLocally = React.useCallback((id: string) => {
        setAll((prev) => prev.filter((x) => x.data.id !== id));
        setVisible((prev) => prev.filter((x) => x.data.id !== id));
    }, []);

    return { visible, loading, error, hasMore, loadMore, removeLocally, setVisible };
}
