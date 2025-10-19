import * as React from "react";
import LikeButton from "@components/ui/LikeButton";
import DislikeButton from "@components/ui/DislikeButton";
import s from "./style/comments.module.scss";
import {likeComment, unlikeComment} from "@features/likes/comments.ts";
import {getComment} from "@features/comments/get.ts";
import {type LikeType, type MyReaction, parseMyReaction} from "@features/likes/types.ts";

type Props = {
    commentId: string;
    initialLikes: number;
    initialDislikes: number;
    initialMyReaction: MyReaction;
};

export default function CommentReactions({
        commentId,
        initialLikes,
        initialDislikes,
        initialMyReaction: initialUserReaction,
    }: Props) {
    const [likes, setLikes] = React.useState(initialLikes);
    const [dislikes, setDislikes] = React.useState(initialDislikes);
    const [userReaction, setUserReaction] = React.useState<MyReaction>(initialUserReaction);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        setLikes(initialLikes);
        setDislikes(initialDislikes);
        setUserReaction(initialUserReaction);
    }, [initialLikes, initialDislikes, initialUserReaction]);

    const applyFromServer = (payload: any) => {
        const rawLikes =
            payload?.data?.likes ?? payload?.likes ?? likes;
        const rawDislikes =
            payload?.data?.dislikes ?? payload?.dislikes ?? dislikes;
        const rawReaction =
            payload?.user_reaction ??
            payload?.data?.user_reaction ??
            payload?.reaction ??
            payload?.type ??
            null;

        setLikes(Number(rawLikes));
        setDislikes(Number(rawDislikes));
        setUserReaction(parseMyReaction(
            typeof rawReaction === "string" ? rawReaction.toLowerCase() : rawReaction
        ));
    };

    const handleReact = async (type: LikeType) => {
        if (busy) return;
        setBusy(true);
        try {
            let com = await getComment(commentId);
            if (!com) {
                console.error("Comment not found for reacting:", commentId);
                return;
            }

            let userReaction = parseMyReaction(com.user_reaction)

            console.log("Reacting to comment", { commentId, type, userReaction });

            const updated =
                userReaction === type ? await unlikeComment(commentId) : await likeComment(commentId, type);

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

    return (
        <div className={s.reactions} role="group" aria-label="Reactions">
            <LikeButton
                active={userReaction === "like"}
                disabled={busy}
                aria-pressed={userReaction === "like"}
                onClick={() => handleReact("like")}
                count={likes}
            />

            <DislikeButton
                active={userReaction === "dislike"}
                disabled={busy}
                aria-pressed={userReaction === "dislike"}
                onClick={() => handleReact("dislike")}
                count={dislikes}
            />
        </div>
    );
}