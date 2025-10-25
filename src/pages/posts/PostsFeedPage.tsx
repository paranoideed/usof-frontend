import * as React from "react";
import { useSearchParams } from "react-router-dom";

import usePostsFeed from "./hooks/usePostsFeed";

import Fab from "@components/ui/Fab";
import NavBar from "@/components/ui/NavBar";
import CreatePostModal from "@pages/posts/CreatePostModal";

import api from "@features/api";
import type { ListPostsParams } from "@features/posts/list.ts";

import s from "@/pages/posts/PostsFeedPage.module.scss";
import PostsList from "@components/posts/PostsList.tsx";
import PostListFilterPanel, { type CategoryRow } from "@components/posts/PostListFilterPanel";

export function useCategories() {
    const [items, setItems] = React.useState<CategoryRow[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        let ok = true;

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                // при желании можно передать limit/offset
                const r = await api.get("/categories");

                // JSON:API: r.data = { data: Array<Resource>, meta? }
                const rows: any[] = r?.data?.data ?? [];
                const mapped: CategoryRow[] = rows.map((cat) => ({
                    id: String(cat.id),
                    // у тебя в типах category.attributes.title; на всякий случай fallback на name
                    title: cat?.attributes?.title ?? cat?.attributes?.name ?? "",
                }));

                if (ok) setItems(mapped);
            } catch (e: any) {
                if (ok) setErr(e?.message ?? "Failed to load categories");
            } finally {
                if (ok) setLoading(false);
            }
        })();

        return () => {
            ok = false;
        };
    }, []);

    return { items, loading, err };
}


export default function PostsFeedPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCat = searchParams.get("category") ?? "";

    const [q, setQ] = React.useState("");
    const [orderBy, setOrderBy] =
        React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [orderDir, setOrderDir] = React.useState<"asc" | "desc">("desc");
    const [createOpen, setCreateOpen] = React.useState(false);
    const [categoryId, setCategoryId] = React.useState<string>(initialCat);

    React.useEffect(() => {
        const urlCat = searchParams.get("category") ?? "";
        setCategoryId((prev) => (prev === urlCat ? prev : urlCat));
    }, [searchParams]);

    React.useEffect(() => {
        const next = new URLSearchParams(searchParams);
        if (categoryId) next.set("category", categoryId);
        else next.delete("category");
        setSearchParams(next, { replace: true });
    }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

    const {
        items: categories,
        loading: catLoading,
        err: catErr,
    } = useCategories();

    const filters = React.useMemo<ListPostsParams>(
        () => ({
            title: q || undefined,
            order_by: orderBy,
            order_dir: orderDir,
            category_id: categoryId || undefined,
        }),
        [q, orderBy, orderDir, categoryId]
    );

    const { items, loading, err, hasMore, loadMore, reload } = usePostsFeed({
        pageSize: 10,
        baseFilters: filters,
    });

    const onCreated = () => reload();

    return (
        <div className={s.root}>
            <NavBar />

            <div className={s.wrap}>
                <PostListFilterPanel
                    q={q}
                    onChangeQ={setQ}
                    orderBy={orderBy}
                    onChangeOrderBy={setOrderBy}
                    orderDir={orderDir}
                    onChangeOrderDir={setOrderDir}
                    categoryId={categoryId}
                    onChangeCategoryId={setCategoryId}
                    categories={categories}
                    catLoading={catLoading}
                />

                {catErr && <div className={s.error}>Failed to load categories: {catErr}</div>}
                {err && <div className={s.error}>{err}</div>}

                <PostsList
                    items={items}
                    loading={loading}
                    hasMore={hasMore}
                    loadMore={loadMore}
                />

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
