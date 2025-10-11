import {Link} from "react-router-dom";
import * as React from "react";

import {parseMyReaction, type Post} from "@features/posts/posts.ts";
import DEFAULT_PIC from "@features/ui.ts";

import s from "@components/posts/PostFull.module.scss";
import LikeButton from "@components/ui/LikeButton.tsx";
import DislikeButton from "@components/ui/DislikeButton.tsx";

import { likePost, unlikePost, type MyReaction } from "@/features/posts/posts";

export default function PostFull(props: Post) {
    const postId = String(props.data.id ?? props.data.id); // на всякий случай
    const [likes, setLikes] = React.useState<number>(props.data.likes ?? 0);
    const [dislikes, setDislikes] = React.useState<number>(props.data.dislikes ?? 0);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(parseMyReaction(props.user_reaction));
    const [busy, setBusy] = React.useState(false);

    async function handleLike() {
        if (busy) return;
        setBusy(true);

        try {
            if (myReaction === "like") {
                // снятие лайка
                setLikes(v => Math.max(0, v - 1));
                setMyReaction(null);
                await unlikePost(postId);
            } else if (myReaction === "dislike") {
                // переключение dislike -> like
                setDislikes(v => Math.max(0, v - 1));
                setLikes(v => v + 1);
                setMyReaction("like");
                await likePost(postId, "like");
            } else {
                // установка лайка
                setLikes(v => v + 1);
                setMyReaction("like");
                await likePost(postId, "like");
            }
        } catch (e) {
            // откат, если бэк отлупил
            if (myReaction === "like") {
                setLikes(v => v + 1); // возвращаем как было до снятия
                setMyReaction("like");
            } else if (myReaction === "dislike") {
                setDislikes(v => v + 1);
                setLikes(v => Math.max(0, v - 1));
                setMyReaction("dislike");
            } else {
                setLikes(v => Math.max(0, v - 1));
                setMyReaction(null);
            }
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    async function handleDislike() {
        if (busy) return;
        setBusy(true);

        try {
            if (myReaction === "dislike") {
                // снятие дизлайка
                setDislikes(v => Math.max(0, v - 1));
                setMyReaction(null);
                await unlikePost(postId);
            } else if (myReaction === "like") {
                // переключение like -> dislike
                setLikes(v => Math.max(0, v - 1));
                setDislikes(v => v + 1);
                setMyReaction("dislike");
                await likePost(postId, "dislike");
            } else {
                // установка дизлайка
                setDislikes(v => v + 1);
                setMyReaction("dislike");
                await likePost(postId, "dislike");
            }
        } catch (e) {
            // откат
            if (myReaction === "dislike") {
                setDislikes(v => v + 1);
                setMyReaction("dislike");
            } else if (myReaction === "like") {
                setLikes(v => v + 1);
                setDislikes(v => Math.max(0, v - 1));
                setMyReaction("like");
            } else {
                setDislikes(v => Math.max(0, v - 1));
                setMyReaction(null);
            }
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className={s.postCard}>
            <div className={s.header}>
                <div>
                    <img className={s.avatar} src={DEFAULT_PIC} alt="avatar" />
                </div>
                <div className={s.meta}>
                    <div className={s.username}>
                        <Link
                            to={`/profiles/u/${props.data.author_username}`}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            {props.data.author_username ?? `@${props.data.author_username}`}
                        </Link>
                    </div>
                    <div className={s.date}>
                        {new Date(props.data.created_at).toDateString().slice(3)}
                    </div>
                </div>
            </div>

            <h1 className={s.title}>{props.data.title}</h1>

            <div className={s.meta}>
                <span>by {props.data.author_username}</span>
                <span>{new Date(props.data.created_at).toLocaleDateString()}</span>
                <span className={s.categories}></span>
            </div>

            <p className={s.content}>{props.data.content}</p>

            <div className={s.actions}>
                <div className={s.actions}>
                    <LikeButton
                        active={myReaction === "like"}
                        onClick={handleLike}
                        disabled={busy}
                        count={likes}
                        aria-pressed={myReaction === "like"}
                    />
                    <DislikeButton
                        active={myReaction === "dislike"}
                        onClick={handleDislike}
                        disabled={busy}
                        count={dislikes}
                        aria-pressed={myReaction === "dislike"}
                    />
                </div>
            </div>

            <hr />
        </div>
    );
}
