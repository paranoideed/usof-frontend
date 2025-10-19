import * as React from "react";
import LikeButton from "@components/ui/LikeButton";
import DislikeButton from "@components/ui/DislikeButton";
import s from "./CommentsSection.module.scss";
import {type LikeType, type MyReaction, parseMyReaction} from "@features/likes/types.ts";
import {likeComment, unlikeComment} from "@features/likes/comments.ts";

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
        initialMyReaction,
    }: Props) {
    const [likes, setLikes] = React.useState(initialLikes);
    const [dislikes, setDislikes] = React.useState(initialDislikes);
    const [myReaction, setMyReaction] = React.useState<MyReaction>(initialMyReaction);
    const [busy, setBusy] = React.useState(false);

    const onReact = async (type: LikeType) => {
        if (busy) return;
        setBusy(true);
        try {
            const updated = (myReaction === type)
                ? await unlikeComment(commentId)
                : await likeComment(commentId, type);

            setLikes(updated.data.likes);
            setDislikes(updated.data.dislikes);
            setMyReaction(parseMyReaction(updated.user_reaction));
        } catch (e) {
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={s.reactions}>
            <LikeButton
                active={myReaction === "like"}
                disabled={busy}
                count={likes}
                onClick={() => onReact("like")}
                aria-pressed={myReaction === "like"}
            />
            <DislikeButton
                active={myReaction === "dislike"}
                disabled={busy}
                count={dislikes}
                onClick={() => onReact("dislike")}
                aria-pressed={myReaction === "dislike"}
            />
        </div>
    );
}