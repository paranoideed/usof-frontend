import * as React from "react";

import NavBar from "@/components/ui/NavBar";
import PostSmall from "@/components/posts/PostSmall";
import usePostsFeed from "./hooks/usePostsFeed";

import Fab from "@components/ui/Fab.tsx";
import CreatePostModal from "@pages/posts/CreatePostModal.tsx";

import s from "@/pages/posts/PostsFeedPage.module.scss";
import Button from "@components/ui/Button.tsx";

export default function PostsFeedPage() {
    const [q, setQ] = React.useState("");
    const [orderBy, setOrderBy] = React.useState<"rating" | "created_at" | "likes" | "dislikes">("rating");
    const [createOpen, setCreateOpen] = React.useState(false);

    const { items, loading, err, hasMore, loadMore, reload } = usePostsFeed({
        pageSize: 10,
        baseFilters: {
            title: q || undefined,
            order_by: orderBy,
            order_dir: "desc",
        },
    });

    React.useEffect(() => {
        reload();
    }, [q, orderBy]);

    const onCreated = () => {
        reload();
    };

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
                </div>

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
