import * as React from "react";
import { useParams } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import ProfileView from "@/components/profiles/ProfileView.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfileBy from "./hooks/useProfileBy";

import s from "./UserProfile.module.scss";

import PostsList from "@components/posts/PostsList.tsx";
import usePostsFeed from "@pages/posts/hooks/usePostsFeed.ts";
import type { ListPostsParams } from "@features/posts/fetch.ts";

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.user_id || undefined;
    const username = params.username || undefined;

    // локальные контролы для сортировки (если решишь вывести селект позже)
    const [orderBy, setOrderBy] =
        React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [q, setQ] = React.useState<string>("");

    // грузим профиль по user_id или username
    const { data, loading, error, status } = useProfileBy(userId, username);

    // базовые фильтры для постов конкретного автора
    const filters = React.useMemo<ListPostsParams>(() => {
        return {
            author_id: data?.id || undefined,
            title: q || undefined,
            order_by: orderBy,
            order_dir: "desc",
        };
    }, [data?.id, q, orderBy]);

    // фид постов пользователя
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

    // когда подгрузился профиль или поменялись контролы — перезагрузить список
    React.useEffect(() => {
        // не дергаем reload пока не знаем автора
        if (data?.id) reload();
    }, [data?.id, orderBy, q]); // eslint-disable-line react-hooks/exhaustive-deps

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
                            user_id={data.id}
                            username={data.username}
                            pseudonym={data.pseudonym ?? undefined}
                            reputation={data.reputation}
                            created_at={data.created_at}
                        />
                    )}
                </div>

                <div className={s.postsBlock}>
                    {postsErr && <div className={s.error}>{String(postsErr)}</div>}

                    {/*<div className={s.controls}>*/}
                    {/*  <input*/}
                    {/*    className={s.filterInput}*/}
                    {/*    value={q}*/}
                    {/*    onChange={(e) => setQ(e.currentTarget.value)}*/}
                    {/*    placeholder="Search by title"*/}
                    {/*  />*/}
                    {/*  <select*/}
                    {/*    className={s.btn}*/}
                    {/*    value={orderBy}*/}
                    {/*    onChange={(e) => setOrderBy(e.currentTarget.value as any)}*/}
                    {/*    title="Sort posts"*/}
                    {/*  >*/}
                    {/*    <option value="rating">rating</option>*/}
                    {/*    <option value="created_at">created_at</option>*/}
                    {/*    <option value="likes">likes</option>*/}
                    {/*    <option value="dislikes">dislikes</option>*/}
                    {/*  </select>*/}
                    {/*</div>*/}

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
