import * as React from "react";

import Button from "@components/ui/Button.tsx";
import CommentReactions from "@/components/comments/CommentReactions";

import { fetchCommentsByParent } from "@features/comments/list.ts";
import { canDeleteComment, deleteComment } from "@/features/comments/delete";
import { getCurrentUserId, getCurrentUserRole } from "@/features/auth/sessions";
import { parseMyReaction } from "@features/likes/like.ts";

import type { Comment } from "@features/comments/comment.ts";
import { ReplyContext } from "@/components/comments/CommentsSection";

import s from "./CommentThread.module.scss";

const PAGE_SIZE = 10;
const CAP_DEPTH = 4;          // глубина, после которой визуально не сдвигаем
const STEP_PX   = 16;

type Props = {
    postId: string;
    comment: Comment;      // этот узел
    depth?: number;
    replies: number;       // replies_count
    onDeleted?: (id: string) => void; // если удалён именно этот узел
};

export default function CommentThread({ postId, comment, depth = 0, replies, onDeleted }: Props) {
    const [showReplies, setShowReplies] = React.useState(false);

    const visualDepth = Math.min(depth, CAP_DEPTH);
    const indentPx = visualDepth * STEP_PX;

    const [repliesState, setReplies] = React.useState<Comment[]>([]);
    const [rOffset, setROffset] = React.useState(0);
    const [rTotal, setRTotal] = React.useState<number | null>(null);
    const [loadingReplies, setLoadingReplies] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const [deleting, setDeleting] = React.useState(false);
    const [deleteErr, setDeleteErr] = React.useState<string | null>(null);

    const meId = getCurrentUserId();
    const role = getCurrentUserRole();
    const canDeleteRoot = canDeleteComment(comment, meId, role);

    const [repliesCount, setRepliesCount] = React.useState<number>(replies ?? 0);
    React.useEffect(() => { setRepliesCount(replies ?? 0); }, [replies]);

    const effectiveTotal = (typeof rTotal === "number" ? rTotal : repliesCount);
    const hasReplies = effectiveTotal > 0;

    const hasMoreReplies = typeof rTotal === "number"
        ? repliesState.length < rTotal
        : repliesState.length !== 0 && repliesState.length % PAGE_SIZE === 0;

    const ensureLoadReplies = async () => {
        if (loadingReplies || repliesState.length > 0 || rOffset > 0) return;
        setLoadingReplies(true);
        try {
            const res = await fetchCommentsByParent(postId, comment.data.id, PAGE_SIZE, 0);

            setReplies((res.data ?? []).map(d => ({ data: d })));
            setRTotal(res.meta?.total ?? (res.data ?? []).length);
            setROffset((res.meta?.offset ?? 0) + (res.meta?.limit ?? PAGE_SIZE));
        } finally {
            setLoadingReplies(false);
        }
    };

    const loadMoreReplies = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchCommentsByParent(postId, comment.data.id, PAGE_SIZE, rOffset);

            setReplies(prev => [...prev, ...((res.data ?? []).map(d => ({ data: d })))]);
            setRTotal(res.meta?.total ?? rTotal ?? null);
            setROffset((res.meta?.offset ?? rOffset) + (res.meta?.limit ?? PAGE_SIZE));
            setShowReplies(true);
        } finally {
            setLoadingMore(false);
        }
    };

    const toggleReplies = async () => {
        if (!showReplies) {
            await ensureLoadReplies();
            setShowReplies(true);
        } else {
            setShowReplies(false);
        }
    };

    const labelRepliesBtn = showReplies
        ? `Hide answers (${effectiveTotal})`
        : `Show answers (${effectiveTotal})`;

    const reply = React.useContext(ReplyContext);
    const openReplyDock = () => {
        reply.open({
            postId,
            parent: comment,
            onCreated: (created) => {
                setReplies((prev) => [created, ...prev]);
                setShowReplies(true);
                setRTotal((t) => (typeof t === "number" ? t + 1 : t));
                setRepliesCount((n) => n + 1);
            },
        });
    };

    const handleDeleteRoot = async () => {
        if (deleting) return;
        if (!confirm("Delete comment?")) return;
        setDeleting(true);
        setDeleteErr(null);
        try {
            await deleteComment(comment.data.id);
            onDeleted?.(comment.data.id);
        } catch (e: any) {
            setDeleteErr(e?.response?.data?.error ?? e?.message ?? "Failed to delete comment");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <li
            className={s.item}
            style={{ ['--indent' as any]: `${indentPx}px` } as React.CSSProperties}
        >

            <div className={s.header}>
                <span className={s.author}>@{comment.data.attributes.author_username}</span>
                <time className={s.time}>{new Date(comment.data.attributes.created_at).toLocaleString()}</time>
            </div>

            <p className={s.content}>{comment.data.attributes.content}</p>

            <div className={s.btnFooter}>
                <div>
                    <CommentReactions
                        commentId={comment.data.id}
                        initialLikes={comment.data.attributes.likes}
                        initialDislikes={comment.data.attributes.dislikes}
                        initialMyReaction={parseMyReaction(comment.data.attributes.user_reaction)}
                    />
                </div>

                <div className={s.actions}>
                    <div>
                        <Button onClick={openReplyDock}>Answer</Button>
                    </div>
                    <div>
                        {hasReplies && (
                            <Button onClick={toggleReplies}>
                                {labelRepliesBtn}
                            </Button>
                        )}
                    </div>
                    {canDeleteRoot && (
                        <div>
                            <Button
                                onClick={handleDeleteRoot}
                                disabled={deleting}
                                aria-label="Delete comment"
                                title="Delete comment"
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {deleteErr && <div className={s.fieldErr}>{deleteErr}</div>}

            {showReplies && (
                <ul className={s.children}>
                    {loadingReplies ? (
                        <div className={s.loading}>Loading…</div>
                    ) : (
                        repliesState.map((r) => (
                            <CommentThread
                                key={r.data.id}
                                postId={postId}
                                comment={r}
                                depth={depth + 1}
                                replies={r.data.attributes.replies_count}
                                onDeleted={(id) => {
                                    setReplies((prev) => prev.filter((x) => x.data.id !== id));
                                    setRTotal((t) => (typeof t === "number" ? Math.max(0, t - 1) : t));
                                    setRepliesCount((n) => Math.max(0, n - 1));
                                }}
                            />
                        ))
                    )}
                </ul>
            )}

            {showReplies && hasMoreReplies && (
                <div className={s.moreWrap}>
                    <button className={s.moreBtn} onClick={loadMoreReplies} disabled={loadingMore}>
                        {loadingMore ? "Loading…" : "Show answers"}
                    </button>
                    {typeof effectiveTotal === "number" && (
                        <span className={s.totalHint}>
                            Show {repliesState.length} from {effectiveTotal}
                        </span>
                    )}
                </div>
            )}
        </li>
    );
}
