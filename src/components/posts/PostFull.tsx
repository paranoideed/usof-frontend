import * as React from "react";
import { Link, useNavigate, createSearchParams } from "react-router-dom";

import Button from "@components/ui/Button.tsx";
import LikeButton from "@components/ui/LikeButton.tsx";
import DislikeButton from "@components/ui/DislikeButton.tsx";
import RatingPost from "@components/ui/RatingPost.tsx";
import MarkdownView from "@components/ui/MarkdownView";

import EditPostModal from "@pages/posts/EditPostModal.tsx";

import { getPost } from "@features/posts/get.ts";
import { deletePost } from "@features/posts/delete.ts";
import { updatePostStatus } from "@features/posts/update.ts";
import { likePost, unlikePost} from "@features/likes/posts.ts";
import { getCurrentUserId, getCurrentUserRole } from "@features/auth/sessions.ts";

import {type MyReaction, parseMyReaction } from "@features/likes/like.ts";
import { type Post } from "@/features/posts/post";

import s from "@components/posts/PostFull.module.scss";
import getUserPic from "@features/ui.ts";
import AvatarImg from "@components/ui/AvatarImg.tsx";

export default function PostFull(props: Post) {
    const navigate = useNavigate();

    const [post, setPost] = React.useState(props.data);
    const [cats, setCats] = React.useState(props.data.attributes.categories ?? []);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(parseMyReaction(props.data.attributes.user_reaction));
    const [busy, setBusy] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);

    React.useEffect(() => {
        setPost(props.data);
        setCats(props.data.attributes.categories ?? []);
        setMyReaction(parseMyReaction(props.data.attributes.user_reaction));
    }, [props.data, props.data.attributes.categories, props.data.attributes.user_reaction]);

    const meId = getCurrentUserId();
    const meRole = getCurrentUserRole();
    const canDelete = meRole === "admin" || (meId && meId === post.attributes.author_id);
    const canManage = meRole === "admin" || (meId && meId === post.attributes.author_id);
    const canEdit = Boolean(meId && meId === post.attributes.author_id);

    const isClosed = post.attributes.status === "closed";
    const nextStatus = isClosed ? "active" : "closed";

    async function refreshFromServer() {
        const fresh = await getPost(post.id);
        setPost(fresh.data);
        setCats(fresh.data.attributes.categories ?? []);
        setMyReaction(parseMyReaction(fresh.data.attributes.user_reaction));
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
        if (!confirm("Delete post?")) return;
        setBusy(true);
        try {
            await deletePost(post.id);
            navigate("/posts");
        } catch {
            alert("Cannot delete post");
        } finally {
            setBusy(false);
        }
    }

    async function onToggleStatus() {
        if (!canManage || busy) return;
        setBusy(true);
        const prev = post.attributes.status;
        setPost((p) => ({ ...p, status: nextStatus })); // оптимистичный апдейт
        try {
            await updatePostStatus({
                postId: post.id,
                status: nextStatus,
            });
        } catch {
            setPost((p) => ({ ...p, status: prev })); // откат
            alert("Cannot update post status");
        } finally {
            setBusy(false);
        }
    }

    const goToCategory = (id: string) => {
        navigate({
            pathname: "/posts",
            search: `?${createSearchParams({ category: id })}`,
        });
    };

    return (
        <div className={s.postCard}>
            <div className={s.header}>
                <div className={s.postInfo}>
                    <div className={s.meta}>
                        <AvatarImg className={s.avatar} src={getUserPic(post.attributes.author_avatar_url)} alt="avatar" />
                        <div className={s.username}>
                            <Link
                                to={`/profiles/u/${post.attributes.author_username}`}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                @{post.attributes.author_username ?? `@${post.attributes.author_username}`}
                            </Link>
                        </div>
                    </div>

                    <h1 className={s.title}>{post.attributes.title}</h1>

                    {cats?.length ? (
                        <div className={s.categories}>
                            {cats.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={s.category}
                                    title={c.description || c.title}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToCategory(c.id);
                                    }}
                                >
                                    #{c.title}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div className={s.date}>
                        <span>Published: {new Date(post.attributes.created_at).toDateString()}</span>
                    </div>
                </div>

                <div className={s.headerButtonsContainer}>
                    <RatingPost count={(post.attributes.likes - post.attributes.dislikes) || 0} />
                </div>
            </div>

            <div className={s.content}>
                <MarkdownView>{post.attributes.content}</MarkdownView>
            </div>

            <div className={s.actions}>
                <div className={s.BottomGroupBtn}>
                    <LikeButton
                        active={myReaction === "like"}
                        onClick={onLike}
                        disabled={busy}
                        count={post.attributes.likes}
                        aria-pressed={myReaction === "like"}
                    />
                    <DislikeButton
                        active={myReaction === "dislike"}
                        onClick={onDislike}
                        disabled={busy}
                        count={post.attributes.dislikes}
                        aria-pressed={myReaction === "dislike"}
                    />
                </div>

                <div className={s.BottomGroupBtn}>
                    {canEdit && (
                        <Button onClick={() => setEditOpen(true)} title="Update post">
                            Edit
                        </Button>
                    )}
                    {canManage && (
                        <Button onClick={onToggleStatus} disabled={busy} title={isClosed ? "Reopen post" : "Close post"}>
                            {isClosed ? "Reopen" : "Close"}
                        </Button>
                    )}
                    {canDelete && (
                        <Button onClick={onDelete} disabled={busy} title="Delete post">
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
                    initialTitle={post.attributes.title}
                    initialContent={post.attributes.content}
                    initialCategories={cats ?? []}
                />
            )}

            <hr />
        </div>
    );
}
