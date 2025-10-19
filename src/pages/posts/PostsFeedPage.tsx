import * as React from "react";

import NavBar from "@/components/ui/NavBar";
import PostSmall from "@/components/posts/PostSmall";
import usePostsFeed from "./hooks/usePostsFeed";

import Fab from "@components/ui/Fab.tsx";
import CreatePostModal from "@pages/posts/CreatePostModal.tsx";

import s from "@/pages/posts/PostsFeedPage.module.scss";
import Button from "@components/ui/Button.tsx";
import { api } from "@/features/client";
import type {ListPostsParams} from "@features/posts/fetch.ts";

type CategoryRow = { id: string; title: string };

function useCategories() {
    const [items, setItems] = React.useState<CategoryRow[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        let ok = true;
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const r = await api.get("/categories");
                // если у тебя JSON:API — тут распарси по-своему, ниже — примитив
                setItems(r.data?.data ?? r.data ?? []);
            } catch (e: any) {
                setErr(e?.message ?? "Failed to load categories");
            } finally {
                if (ok) setLoading(false);
            }
        })();
        return () => { ok = false; };
    }, []);

    return { items, loading, err };
}

export default function PostsFeedPage() {
    const [q, setQ] = React.useState("");
    const [orderBy, setOrderBy] = React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [createOpen, setCreateOpen] = React.useState(false);
    const [categoryId, setCategoryId] = React.useState<string>("");

    const { items: categories, loading: catLoading, err: catErr } = useCategories();

    const filters = React.useMemo<ListPostsParams>(() => ({
        title: q || undefined,
        order_by: orderBy,
        order_dir: "desc",
        category_id: categoryId || undefined,
    }), [q, orderBy, categoryId]);

    const { items, loading, err, hasMore, loadMore, reload } = usePostsFeed({
        pageSize: 10,
        baseFilters: filters,
    });

    const onCreated = () => reload();

    return (
        <div className={s.root}>
            <NavBar />

            <div className={s.wrap}>
                <div className={s.controls}>
                    <input
                        className={s.filterInput}
                        value={q}
                        onChange={(e) => setQ(e.currentTarget.value)}
                        placeholder="Search by title"
                    />

                    <select className={s.btn} value={orderBy} onChange={(e) => setOrderBy(e.currentTarget.value as any)}>
                        <option value="rating">rating</option>
                        <option value="created_at">newest</option>
                        <option value="likes">most likes</option>
                        <option value="dislikes">most dislikes</option>
                    </select>

                    <select
                        className={s.btn}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.currentTarget.value)}
                        disabled={catLoading}
                        title="Filter by category"
                    >
                        <option value="">all categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                {catErr && <div className={s.error}>Failed to load categories: {catErr}</div>}
                {err && <div className={s.error}>{err}</div>}

                <div className={s.list}>
                    {items.map((p) => (
                        <PostSmall key={p.data.id} post={p} />
                    ))}
                </div>

                <div className={s.loader}>
                    {loading && <div>Loading…</div>}
                    {!loading && hasMore && (
                        <Button className={s.btn} onClick={loadMore}>Show More</Button>
                    )}
                    {!loading && !hasMore && items.length > 0 && <div>No more posts</div>}
                </div>

                <Fab onClick={() => setCreateOpen(true)} title="Create post" />
            </div>

            <CreatePostModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={onCreated}
            />
        </div>
    );
}
