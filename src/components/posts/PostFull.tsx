import { Link } from "react-router-dom";
import * as React from "react";

import {
    type Post,
    type MyReaction,
    likePost,
    unlikePost,
    getPost,
    parseMyReaction,
    getMyReaction
} from "@/features/posts/posts";
import DEFAULT_PIC from "@features/ui.ts";

import s from "@components/posts/PostFull.module.scss";
import LikeButton from "@components/ui/LikeButton.tsx";
import DislikeButton from "@components/ui/DislikeButton.tsx";
import RatingPost from "@components/ui/RatingPost.tsx";

export default function PostFull(props: Post) {
    const postId = String(props.data.id);

    const [likes, setLikes] = React.useState<number>(props.data.likes ?? 0);
    const [dislikes, setDislikes] = React.useState<number>(props.data.dislikes ?? 0);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(parseMyReaction(props.user_reaction));
    const [busy, setBusy] = React.useState(false);

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
        console.log("onLike", { busy, myReaction });
        if (busy) return;
        setBusy(true);
        try {
            if (myReaction === "like") {
                await unlikePost(postId);   // ← передаём тип
            } else {
                await likePost(postId, "like");
            }
            await refreshFromServer();
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    async function onDislike() {
        console.log("onDislike", { busy, myReaction });
        if (busy) return;
        setBusy(true);
        try {
            if (myReaction === "dislike") {
                await unlikePost(postId); // ← передаём тип
            } else {
                await likePost(postId, "dislike");
            }
            await refreshFromServer();
        } catch (e) {
            console.error(e);
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

                    <div className={s.date}>
                        <span>Published: {new Date(props.data.created_at).toDateString()}</span>
                    </div>
                </div>
                <RatingPost count={(likes - dislikes) || 0} />
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

            <hr />
        </div>
    );
}
