import * as React from "react";

import LikeButton from "@components/ui/LikeButton";
import DislikeButton from "@components/ui/DislikeButton";

import { getComment } from "@features/comments/get";
import { likeComment, unlikeComment } from "@features/likes/comments";
import { parseMyReaction, type LikeType, type MyReaction } from "@features/likes/like";
import { getCurrentUserId } from "@features/auth/sessions";

import LoginRequiredModal from "@components/ui/LoginRequiredModal.tsx"; // ← добавили
import s from "./CommentReactions.module.scss";

type Props = {
    commentId: string;
    initialLikes: number;
    initialDislikes: number;
    initialMyReaction: MyReaction; // "like" | "dislike" | null
};

export default function CommentReactions({
    commentId,
    initialLikes,
    initialDislikes,
    initialMyReaction,
}: Props) {
    const [likes, setLikes] = React.useState<number>(initialLikes);
    const [dislikes, setDislikes] = React.useState<number>(initialDislikes);
    const [userReaction, setUserReaction] = React.useState<MyReaction>(parseMyReaction(initialMyReaction));
    const [busy, setBusy] = React.useState(false);

    const [loginOpen, setLoginOpen] = React.useState(false); // ← добавили
    const meId = getCurrentUserId();

    React.useEffect(() => {
        setLikes(initialLikes);
        setDislikes(initialDislikes);
        setUserReaction(parseMyReaction(initialMyReaction));
    }, [initialLikes, initialDislikes, initialMyReaction]);

    const applyFromServer = (payload: any) => {
        const src = payload?.data?.attributes ?? payload?.data ?? payload ?? {};

        const rawLikes = src.likes ?? likes;
        const rawDislikes = src.dislikes ?? dislikes;
        const rawReaction = src.user_reaction ?? src.reaction ?? src.type ?? null;

        setLikes(Number(rawLikes));
        setDislikes(Number(rawDislikes));
        setUserReaction(parseMyReaction(typeof rawReaction === "string" ? rawReaction.toLowerCase() : rawReaction));
    };

    function ensureAuth(): boolean {
        if (!meId) {
            setLoginOpen(true);  // ← открываем модалку
            return false;
        }
        return true;
    }

    const handleReact = async (type: LikeType) => {
        if (busy) return;

        if (!ensureAuth()) return; // ← проверка авторизации

        setBusy(true);
        try {
            const current = await getComment(commentId);
            const currentReaction = parseMyReaction(current?.data?.attributes?.user_reaction ?? null);

            const updated =
                currentReaction === type
                    ? await unlikeComment(commentId)
                    : await likeComment(commentId, type);

            if (updated) {
                applyFromServer(updated);
            } else {
                const fresh = await getComment(commentId);
                applyFromServer(fresh);
            }
        } catch (e) {
            console.error("Failed to react to comment:", e);
        } finally {
            setBusy(false);
        }
    };

    // ВАЖНО: не отключаем кнопки для неавторизованного, чтобы клик открыл модалку
    const likeDisabled = busy;
    const dislikeDisabled = busy;

    return (
        <div className={s.reactions} role="group" aria-label="Reactions">
            <LikeButton
                active={userReaction === "like"}
                disabled={likeDisabled}
                aria-pressed={userReaction === "like"}
                onClick={() => handleReact("like")}
                count={likes}
            />
            <DislikeButton
                active={userReaction === "dislike"}
                disabled={dislikeDisabled}
                aria-pressed={userReaction === "dislike"}
                onClick={() => handleReact("dislike")}
                count={dislikes}
            />

            <LoginRequiredModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
    );
}
