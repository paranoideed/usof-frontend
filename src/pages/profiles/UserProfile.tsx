import * as React from "react";
import { useParams } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import ProfileView from "@/components/profiles/ProfileView.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfileBy from "./hooks/useProfileBy";

import s from "./UserProfile.module.scss";

import PostsList from "@components/posts/PostsList.tsx";
import usePostsFeed from "@pages/posts/hooks/usePostsFeed.ts";
import type { ListPostsParams } from "@features/posts/list.ts";
import PostListFilterPanel from "@components/posts/PostListFilterPanel.tsx";

import {useCategories} from "@pages/posts/PostsFeedPage.tsx";

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.user_id || undefined;
    const username = params.username || undefined;

    const [q, setQ] = React.useState<string>("");
    const [orderBy, setOrderBy] =
        React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [orderDir, setOrderDir] = React.useState<"asc" | "desc">("desc");
    const [categoryId, setCategoryId] = React.useState<string>("");

    const { data, loading, error, status } = useProfileBy(userId, username);

    const { items: categories, loading: catLoading, err: catErr } = useCategories();

    const filters = React.useMemo<ListPostsParams>(() => {
        return {
            author_id: data?.data.id || undefined,
            title: q || undefined,
            order_by: orderBy,
            order_dir: orderDir,
            category_id: categoryId || undefined,
        };
    }, [data?.data.id, q, orderBy, orderDir, categoryId]);

    const {
        items,
        loading: postsLoading,
        err: postsErr,
        hasMore,
        loadMore,
        reload,
    } = usePostsFeed({
        pageSize: 10,
        baseFilters: filters,
    });

    React.useEffect(() => {
        if (data?.data.id) reload();
    }, [data?.data.id, q, orderBy, orderDir, categoryId]);

    if (loading) return <div className={s.root}>Loading…</div>;

    const noIdentity = !userId && !username;

    return (
        <div className={s.root}>
            <NavBar />

            <div className={s.container}>
                <div className={s.card}>
                    {noIdentity && <FormError>Neither user_id nor username provided</FormError>}

                    {error && (
                        <FormError>{status === 404 ? "User not found" : String(error)}</FormError>
                    )}

                    {data && (
                        <ProfileView
                            profile={data}
                        />
                    )}
                </div>

                <div className={s.postsBlock}>
                    {catErr && <div className={s.error}>Failed to load categories: {catErr}</div>}
                    {postsErr && <div className={s.error}>{String(postsErr)}</div>}

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

                    <PostsList
                        items={items}
                        loading={postsLoading}
                        hasMore={hasMore}
                        loadMore={loadMore}
                    />
                </div>
            </div>
        </div>
    );
}
