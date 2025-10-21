import * as React from "react";
import { z } from "zod";

import Button from "@components/ui/Button.tsx";
import CommentReactions from "@/components/comments/CommentReactions";

import { createComment } from "@/features/comments/create";
import { parseMyReaction } from "@/features/likes/types";
import { fetchCommentsByParent } from "@/features/comments/fetched";
import { canDeleteComment, deleteComment } from "@/features/comments/delete";
import { getCurrentUserId, getCurrentUserRole } from "@/features/auth/sessions";

import type { Comment } from "@/features/comments/types";

import s from "./CommentThread.module.scss";

const ContentSchema = z.string().min(1, "Пустой комментарий").max(1000, "Слишком длинно");
const PAGE_SIZE = 10;

type Props = {
    postId: string;
    comment: Comment;            // корневой комментарий ветки
    depth?: number;
    replies: number;         // количество ответов (для показа кнопки загрузки)
    onLocalReplyAdded?: (c: Comment) => void;
    onDeleted?: (id: string) => void;    // сообщим родителю, если удалили корневой
};

export default function CommentThread({ postId, comment, depth = 0, replies, onDeleted }: Props) {
    const [showReply, setShowReply] = React.useState(false);      // форма ответа
    const [showReplies, setShowReplies] = React.useState(false);  // список ответов

    const [replyText, setReplyText] = React.useState("");
    const [replyErr, setReplyErr] = React.useState<string | null>(null);
    const [posting, setPosting] = React.useState(false);

    const [repliesState, setReplies] = React.useState<Comment[]>([]);
    const [rOffset, setROffset] = React.useState(0);
    const [rTotal, setRTotal] = React.useState<number | null>(null);
    const [loadingReplies, setLoadingReplies] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const [deleting, setDeleting] = React.useState(false);
    const [deleteErr, setDeleteErr] = React.useState<string | null>(null);

    const meId = getCurrentUserId();
    const role = getCurrentUserRole();

    const [repliesCount, setRepliesCount] = React.useState<number>(replies ?? 0);
    React.useEffect(() => {
        setRepliesCount(replies ?? 0);
    }, [replies]);

    const canDeleteRoot = canDeleteComment(comment, meId, role);

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
            setReplies(res.data ?? []);
            if (typeof res.total === "number") {
                setRTotal(res.total);
            } else {
                setRTotal((res.data ?? []).length);
            }
            setROffset((res.offset ?? 0) + (res.limit ?? PAGE_SIZE));
        } finally {
            setLoadingReplies(false);
        }
    };

    const loadMoreReplies = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchCommentsByParent(postId, comment.data.id, PAGE_SIZE, rOffset);
            setReplies((prev) => [...prev, ...(res.data ?? [])]);
            if (typeof res.total === "number") setRTotal(res.total);
            setROffset((res.offset ?? rOffset) + (res.limit ?? PAGE_SIZE));
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

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        setReplyErr(null);

        const parsed = ContentSchema.safeParse(replyText.trim());
        if (!parsed.success) {
            setReplyErr(parsed.error.issues[0]?.message ?? "Invalid text");
            return;
        }
        const authorId = getCurrentUserId();
        if (!authorId) { setReplyErr("Need login for response"); return; }

        setPosting(true);
        try {
            const created = await createComment({
                post_id: postId,
                author_id: authorId,
                parent_id: comment.data.id,
                content: parsed.data,
            });

            setReplies((prev) => [created, ...prev]);
            setRTotal((t) => (typeof t === "number" ? t + 1 : t));
            setReplyText("");
            setShowReply(false);
            setShowReplies(true);
        } catch (e: any) {
            setReplyErr(e?.response?.data?.error ?? e?.message ?? "Failed to post reply");
        } finally {
            setPosting(false);
        }
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
        <li className={s.item} style={{ marginLeft: depth ? depth * 16 : 0 }}>
            <div className={s.header}>
                <span className={s.author}>@{comment.data.author_username}</span>
                <time className={s.time}>{new Date(comment.data.created_at).toLocaleString()}</time>
            </div>

            <p className={s.content}>{comment.data.content}</p>

            <div className={s.btnFooter}>
                <div>
                    <CommentReactions
                        commentId={comment.data.id}
                        initialLikes={comment.data.likes}
                        initialDislikes={comment.data.dislikes}
                        initialMyReaction={parseMyReaction(comment.user_reaction)}
                    />
                </div>
                <div className={s.actions}>
                    <div>
                        <Button onClick={() => setShowReply((v) => !v)}>
                            {showReply ? "Cansel" : "Answer"}
                        </Button>
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

            {showReply && (
                <form className={s.replyForm} onSubmit={submitReply}>
                <textarea
                    className={s.textarea}
                    value={replyText}
                    onChange={(e) => setReplyText(e.currentTarget.value)}
                    placeholder="Your Answer…"
                    maxLength={1000}
                    rows={3}
                />
                <div className={s.formBar}>
                    <span className={s.counter}>
                        {replyText.length}/1000
                    </span>
                    <div>
                        <Button disabled={posting || replyText.trim().length === 0}>
                            {posting ? "Sending…" : "Send"}
                        </Button>
                    </div>
                </div>
                    {replyErr && <div className={s.fieldErr}>{replyErr}</div>}
                </form>
            )}

            {showReplies && (
                <ul className={s.list} style={{ marginTop: 8 }}>
                    {loadingReplies ? (
                        <div className={s.loading}>Загрузка ответов…</div>
                    ) : (
                        repliesState.map((r) => {
                            const replyCanDelete = canDeleteComment(r, meId, role);

                            const deleteReply = async () => {
                                if (!confirm("Delete Answer?")) return;
                                try {
                                    await deleteComment(r.data.id);
                                    setReplies((prev) => prev.filter((x) => x.data.id !== r.data.id));
                                    setRepliesCount((n) => Math.max(0, n - 1));
                                    setRTotal((t) => (typeof t === "number" ? Math.max(0, t - 1) : t));
                                } catch {
                                    // TODO: показать ошибку
                                }
                            };

                            return (
                                <li key={r.data.id} className={s.item} style={{ marginLeft: 16 }}>
                                    {/* 🔹 ЭТОГО НЕ ХВАТАЛО */}
                                    <div className={s.header}>
                                        <span className={s.author}>@{r.data.author_username}</span>
                                        <time className={s.time}>
                                            {new Date(r.data.created_at).toLocaleString()}
                                        </time>
                                    </div>

                                    <p className={s.content}>{r.data.content}</p>
                                    {/* 🔹 /ЭТОГО НЕ ХВАТАЛО */}

                                    <div className={s.actions}>
                                        <CommentReactions
                                            commentId={r.data.id}
                                            initialLikes={r.data.likes}
                                            initialDislikes={r.data.dislikes}
                                            initialMyReaction={parseMyReaction(r.user_reaction)}
                                        />
                                        {replyCanDelete && (
                                            <div>
                                                <Button onClick={deleteReply}>Delete</Button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })
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
