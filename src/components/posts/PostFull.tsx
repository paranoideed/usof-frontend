import {Link, useNavigate} from "react-router-dom";
import * as React from "react";

import {
    type Post,
    type MyReaction,
    likePost,
    unlikePost,
    getPost,
    parseMyReaction,
    getMyReaction,
    deletePost,
} from "@/features/posts/posts";
import DEFAULT_PIC from "@features/ui.ts";

import s from "@components/posts/PostFull.module.scss";
import LikeButton from "@components/ui/LikeButton.tsx";
import DislikeButton from "@components/ui/DislikeButton.tsx";
import RatingPost from "@components/ui/RatingPost.tsx";
import {getCurrentUserId, getCurrentUserRole} from "@features/auth/sessions.ts";

export default function PostFull(props: Post) {
    const postId = String(props.data.id);
    const navigate = useNavigate();

    const [likes, setLikes] = React.useState<number>(props.data.likes ?? 0);
    const [dislikes, setDislikes] = React.useState<number>(props.data.dislikes ?? 0);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(parseMyReaction(props.user_reaction));
    const [busy, setBusy] = React.useState(false);

    const meId = getCurrentUserId();
    const meRole = getCurrentUserRole();
    const canDelete = meRole === "admin" || (meId && meId === props.data.author_id);

    React.useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const r = await getMyReaction(postId);
                if (alive) setMyReaction(r);
            } catch {}
        })();
        return () => { alive = false; };
    }, [postId]);

    React.useEffect(() => {
        setLikes(props.data.likes ?? 0);
        setDislikes(props.data.dislikes ?? 0);
    }, [props.data.likes, props.data.dislikes]);

    async function refreshFromServer() {
        const fresh = await getPost(postId);
        setLikes(fresh.data.likes ?? 0);
        setDislikes(fresh.data.dislikes ?? 0);
        setMyReaction(parseMyReaction(fresh.user_reaction));
    }

    async function onLike() {
        if (busy) return;
        setBusy(true);
        try {
            if (myReaction === "like") {
                await unlikePost(postId);
            } else {
                await likePost(postId, "like");
            }
            await refreshFromServer();
        } finally {
            setBusy(false);
        }
    }

    async function onDislike() {
        if (busy) return;
        setBusy(true);
        try {
            if (myReaction === "dislike") {
                await unlikePost(postId);
            } else {
                await likePost(postId, "dislike");
            }
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
            await deletePost(postId);
            navigate("/posts"); // или куда тебе нужно после удаления
        } catch (e) {
            console.error(e);
            alert("Не удалось удалить пост");
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
                                to={`/profiles/u/${props.data.author_username}`}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                @{props.data.author_username ?? `@${props.data.author_username}`}
                            </Link>
                        </div>
                    </div>

                    <h1 className={s.title}>{props.data.title}</h1>

                    {props.categories?.length ? (
                        <div className={s.categories}>
                            {props.categories.map((c) => (
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
                        <span>Published: {new Date(props.data.created_at).toDateString()}</span>
                    </div>
                </div>

                <div className={s.headerButtonsContainer}>
                    <RatingPost count={(likes - dislikes) || 0} />
                    {canDelete && (
                        <button className={s.deleteBtn} onClick={onDelete} disabled={busy} title="Удалить пост">
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <p className={s.content}>{props.data.content}</p>

            <div className={s.actions}>
                <LikeButton
                    active={myReaction === "like"}
                    onClick={onLike}
                    disabled={busy}
                    count={likes}
                    aria-pressed={myReaction === "like"}
                />
                <DislikeButton
                    active={myReaction === "dislike"}
                    onClick={onDislike}
                    disabled={busy}
                    count={dislikes}
                    aria-pressed={myReaction === "dislike"}
                />
            </div>

            <hr/>
        </div>
    );
}