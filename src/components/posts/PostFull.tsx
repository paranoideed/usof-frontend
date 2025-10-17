import * as React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    type Post,
    type MyReaction,
    parseMyReaction,
    likePost,
    unlikePost,
    getPost,
    deletePost,
    updatePostStatus,
} from "@/features/posts/posts";

import { getCurrentUserId, getCurrentUserRole } from "@features/auth/sessions.ts";
import DEFAULT_PIC from "@features/ui.ts";

import s from "@components/posts/PostFull.module.scss";
import LikeButton from "@components/ui/LikeButton.tsx";
import DislikeButton from "@components/ui/DislikeButton.tsx";
import RatingPost from "@components/ui/RatingPost.tsx";
import Button from "@components/ui/Button.tsx";
import MarkdownView from "@components/ui/MarkdownView";
import EditPostModal from "@pages/posts/EditPostModal.tsx";

export default function PostFull(props: Post) {
    const navigate = useNavigate();

    const [post, setPost] = React.useState(props.data);
    const [cats, setCats] = React.useState(props.categories ?? []);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(parseMyReaction(props.user_reaction));
    const [busy, setBusy] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);

    React.useEffect(() => {
        setPost(props.data);
        setCats(props.categories ?? []);
        setMyReaction(parseMyReaction(props.user_reaction));
    }, [props.data, props.categories, props.user_reaction]);

    const meId = getCurrentUserId();
    const meRole = getCurrentUserRole();
    const canDelete = meRole === "admin" || (meId && meId === post.author_id);
    const canManage = meRole === "admin" || (meId && meId === post.author_id);
    const canEdit = Boolean(meId && meId === post.author_id);

    const isClosed = post.status === "closed";
    const nextStatus = isClosed ? "active" : "closed";

    async function refreshFromServer() {
        const fresh = await getPost(post.id);
        setPost(fresh.data);
        setCats(fresh.categories ?? []);
        setMyReaction(parseMyReaction(fresh.user_reaction));
    }

    async function onLike() {
        if (busy) return;
        setBusy(true);
        const prev = myReaction;
        setMyReaction(prev === "like" ? null : "like"); // оптимистично
        try {
            if (prev === "like") await unlikePost(post.id);
            else await likePost(post.id, "like");
            await refreshFromServer();
        } finally {
            setBusy(false);
        }
    }

    async function onDislike() {
        if (busy) return;
        setBusy(true);
        const prev = myReaction;
        setMyReaction(prev === "dislike" ? null : "dislike");
        try {
            if (prev === "dislike") await unlikePost(post.id);
            else await likePost(post.id, "dislike");
            await refreshFromServer();
        } finally {
            setBusy(false);
        }
    }

    async function onDelete() {
        if (!canDelete || busy) return;
        if (!confirm("Удалить пост?")) return;
        setBusy(true);
        try {
            await deletePost(post.id);
            navigate("/posts");
        } catch {
            alert("Не удалось удалить пост");
        } finally {
            setBusy(false);
        }
    }

    async function onToggleStatus() {
        if (!canManage || busy) return;
        setBusy(true);
        const prev = post.status;
        setPost((p) => ({ ...p, status: nextStatus })); // оптимистичный апдейт
        try {
            await updatePostStatus(post.id, nextStatus);
        } catch {
            setPost((p) => ({ ...p, status: prev })); // откат
            alert("Не удалось изменить статус");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className={s.postCard}>
            <div className={s.header}>
                <div className={s.postInfo}>
                    <div className={s.meta}>
                        <img className={s.avatar} src={DEFAULT_PIC} alt="avatar" />
                        <div className={s.username}>
                            <Link
                                to={`/profiles/u/${post.author_username}`}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                @{post.author_username ?? `@${post.author_username}`}
                            </Link>
                        </div>
                    </div>

                    <h1 className={s.title}>{post.title}</h1>

                    {cats?.length ? (
                        <div className={s.categories}>
                            {cats.map((c) => (
                                <Link
                                    key={c.id}
                                    to={`/categories/${c.id}`}
                                    className={s.category}
                                    title={c.description || c.title}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    #{c.title}
                                </Link>
                            ))}
                        </div>
                    ) : null}

                    <div className={s.date}>
                        <span>Published: {new Date(post.created_at).toDateString()}</span>
                    </div>
                </div>

                <div className={s.headerButtonsContainer}>
                    <RatingPost count={(post.likes - post.dislikes) || 0} />
                </div>
            </div>

            <div className={s.content}>
                <MarkdownView>{post.content}</MarkdownView>
            </div>

            <div className={s.actions}>
                <div className={s.BottomGroupBtn}>
                    <LikeButton
                        active={myReaction === "like"}
                        onClick={onLike}
                        disabled={busy}
                        count={post.likes}
                        aria-pressed={myReaction === "like"}
                    />
                    <DislikeButton
                        active={myReaction === "dislike"}
                        onClick={onDislike}
                        disabled={busy}
                        count={post.dislikes}
                        aria-pressed={myReaction === "dislike"}
                    />
                </div>

                <div className={s.BottomGroupBtn}>
                    {canEdit && (
                        <Button onClick={() => setEditOpen(true)} title="Редактировать пост">
                            Edit
                        </Button>
                    )}
                    {canManage && (
                        <Button onClick={onToggleStatus} disabled={busy} title={isClosed ? "Reopen post" : "Close post"}>
                            {isClosed ? "Reopen" : "Close"}
                        </Button>
                    )}
                    {canDelete && (
                        <Button onClick={onDelete} disabled={busy} title="Удалить пост">
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {canEdit && (
                <EditPostModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    onUpdated={(updated) => {
                        setPost(updated.data);
                        setCats(updated.categories ?? []);
                        setMyReaction(parseMyReaction(updated.user_reaction));
                        setEditOpen(false);
                    }}
                    postId={post.id}
                    initialTitle={post.title}
                    initialContent={post.content}
                    initialCategories={cats ?? []}
                />
            )}

            <hr />
        </div>
    );
}
