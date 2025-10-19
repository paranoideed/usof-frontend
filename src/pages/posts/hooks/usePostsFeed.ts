import * as React from "react";
import {listPosts, type ListPostsParams} from "@features/posts/fetch.ts";
import type {Post} from "@features/posts/posts.ts";

type UsePostsFeedOpts = {
    pageSize?: number;
    baseFilters?: ListPostsParams;
};

export default function usePostsFeed(opts: UsePostsFeedOpts = {}) {
    const pageSize = opts.pageSize ?? 10;
    const baseFilters = opts.baseFilters ?? { order_by: "rating", order_dir: "desc" };

    const [items, setItems] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);
    const [hasMore, setHasMore] = React.useState(true);
    const [page, setPage] = React.useState(0);

    const load = React.useCallback(async (reset = false) => {
        setLoading(true);
        setErr(null);
        try {
            const offset = reset ? 0 : page * pageSize;
            const params: ListPostsParams = { ...baseFilters, limit: pageSize, offset };
            const res = await listPosts(params);

            const data: Post[] = (res as any).data ?? (res as any).posts ?? [];
            const totalCount: number | null =
                (res as any).total ?? (res as any).pagination?.total ?? null;

            setItems(prev => (reset ? data : [...prev, ...data]));

            if (totalCount !== null) setHasMore(offset + data.length < totalCount);
            else setHasMore(data.length === pageSize);

            if (reset) setPage(1);
            else setPage(p => p + 1);
        } catch (e: any) {
            setErr(e?.response?.data?.error || e?.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    }, [baseFilters, page, pageSize]);

    const reload = React.useCallback(() => {
        setItems([]);
        setPage(0);
        void load(true);
    }, [load]);

    const loadMore = React.useCallback(() => {
        if (!loading && hasMore) void load(false);
    }, [load, loading, hasMore]);

    React.useEffect(() => {
        void load(true);
    }, [JSON.stringify(baseFilters)]); // перезагрузка при смене фильтров

    return { items, loading, err, hasMore, loadMore, reload };
}
