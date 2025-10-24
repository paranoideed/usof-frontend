import * as React from "react";
import { useSearchParams } from "react-router-dom";

import usePostsFeed from "./hooks/usePostsFeed";

import Fab from "@components/ui/Fab";
import NavBar from "@/components/ui/NavBar";
import CreatePostModal from "@pages/posts/CreatePostModal";

import api from "@features/api";

import type { ListPostsParams } from "@features/posts/fetch";

import s from "@/pages/posts/PostsFeedPage.module.scss";
import PostsList from "@components/posts/PostsList.tsx";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCat = searchParams.get("category") ?? "";

    const [q, setQ] = React.useState("");
    const [orderBy, setOrderBy] = React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [createOpen, setCreateOpen] = React.useState(false);
    const [categoryId, setCategoryId] = React.useState<string>(initialCat);

    // если пользователь пришёл по "назад/вперёд" и поменялись searchParams — подтянуть новое значение
    React.useEffect(() => {
        const urlCat = searchParams.get("category") ?? "";
        setCategoryId((prev) => (prev === urlCat ? prev : urlCat));
    }, [searchParams]);

    // при изменении categoryId — обновляем URL (без перезагрузки)
    React.useEffect(() => {
        const next = new URLSearchParams(searchParams);
        if (categoryId) next.set("category", categoryId);
        else next.delete("category");
        setSearchParams(next, { replace: true });
    }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

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
                        <option value="newest">newest</option>
                        <option value="oldest">oldest</option>
                        <option value="likes">likes</option>
                        <option value="dislikes">dislikes</option>
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

                <PostsList items={items} loading={loading} hasMore={hasMore} loadMore={loadMore}></PostsList>

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
