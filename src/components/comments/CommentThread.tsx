import * as React from "react";
import { z } from "zod";
import { getCurrentUserId } from "@/features/auth/sessions";
import s from "./CommentsSection.module.scss";
import CommentReactions from "@components/comments/CommentReactions.tsx";
import {fetchCommentsByParent} from "@features/comments/fetched.ts";
import {createComment} from "@features/comments/create.ts";
import {parseMyReaction} from "@features/likes/types.ts";
import type { Comment } from "@features/comments/types";

const ContentSchema = z.string().min(1, "Пустой комментарий").max(1000, "Слишком длинно");
const PAGE_SIZE = 10;

type Props = {
    postId: string;
    comment: Comment;                    // корневой комментарий ветки
    depth?: number;                      // на будущее, если захочешь многоуровневость
    onLocalReplyAdded?: (c: Comment) => void;
};

export default function CommentThread({ postId, comment, depth = 0 }: Props) {
    const [showReplies, setShowReplies] = React.useState(false);
    const [replyText, setReplyText] = React.useState("");
    const [replyErr, setReplyErr] = React.useState<string | null>(null);
    const [posting, setPosting] = React.useState(false);

    const [replies, setReplies] = React.useState<Comment[]>([]);
    const [rOffset, setROffset] = React.useState(0);
    const [rTotal, setRTotal] = React.useState<number | null>(null);
    const [loadingReplies, setLoadingReplies] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const hasMoreReplies = rTotal !== null
        ? replies.length < rTotal
        : replies.length !== 0 && replies.length % PAGE_SIZE === 0;

    // лениво: загрузим первую порцию ответов при первом раскрытии блока
    const ensureLoadReplies = async () => {
        if (loadingReplies || replies.length > 0 || rOffset > 0) return;
        setLoadingReplies(true);
        try {
            const res = await fetchCommentsByParent(postId, comment.data.id, PAGE_SIZE, 0);
            setReplies(res.data ?? []);
            if (typeof res.total === "number") setRTotal(res.total);
            setROffset((res.offset ?? 0) + (res.limit ?? PAGE_SIZE));
        } finally { setLoadingReplies(false); }
    };

    const loadMoreReplies = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchCommentsByParent(postId, comment.data.id, PAGE_SIZE, rOffset);
            setReplies((prev) => [...prev, ...(res.data ?? [])]);
            if (typeof res.total === "number") setRTotal(res.total);
            setROffset((res.offset ?? rOffset) + (res.limit ?? PAGE_SIZE));
            setShowReplies(true); // на всякий случай держим открытым при догрузке
        } finally { setLoadingMore(false); }
    };

    const labelRepliesBtn =
        showReplies ? "Скрыть ответы"
            : (replies.length > 0 || rOffset > 0) ? "Показать ответы"
                : "Показать ответы";

    const toggleReplies = async () => {
        if (!showReplies) {
            // раскрываем — при первом открытии подгружаем
            await ensureLoadReplies();
            setShowReplies(true);
        } else {
            // скрываем
            setShowReplies(false);
        }
    };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        setReplyErr(null);
        const parsed = ContentSchema.safeParse(replyText.trim());
        if (!parsed.success) {
            setReplyErr(parsed.error.issues[0]?.message ?? "Неверный текст");
            return;
        }
        const authorId = getCurrentUserId();
        if (!authorId) { setReplyErr("Нужно войти, чтобы отвечать"); return; }

        setPosting(true);
        try {
            const created = await createComment({
                post_id: postId,
                author_id: authorId,
                parent_id: comment.data.id,         // ← главное место
                content: parsed.data,
            });
            // Положим новый ответ в начало списка
            setReplies((prev) => [created, ...prev]);
            setRTotal((t) => (typeof t === "number" ? t + 1 : t));
            setReplyText("");
            setShowReplies(false);
        } catch (e: any) {
            setReplyErr(e?.response?.data?.error ?? e?.message ?? "Не удалось отправить ответ");
        } finally { setPosting(false); }
    };

    return (
        <li className={s.item} style={{ marginLeft: depth ? depth * 16 : 0 }}>
            <div className={s.header}>
                <span className={s.author}>@{comment.data.author_username}</span>
                <time className={s.time}>{new Date(comment.data.created_at).toLocaleString()}</time>
            </div>
            <p className={s.content}>{comment.data.content}</p>

            <CommentReactions
                commentId={comment.data.id}
                initialLikes={comment.data.likes}
                initialDislikes={comment.data.dislikes}
                initialMyReaction={parseMyReaction(comment.user_reaction)}
            />

            <div className={s.actions}>
                <button className={s.linkBtn} onClick={() => setShowReplies((v) => !v)}>
                    {showReplies ? "Отмена" : "Ответить"}
                </button>
                <button className={s.linkBtn} onClick={toggleReplies}>
                    {labelRepliesBtn}
                </button>
            </div>

            {showReplies && (
                <form className={s.replyForm} onSubmit={submitReply}>
          <textarea
              className={s.textarea}
              value={replyText}
              onChange={(e) => setReplyText(e.currentTarget.value)}
              placeholder="Ваш ответ…"
              maxLength={1000}
              rows={3}
          />
                    <div className={s.formBar}>
                        <span className={s.counter}>{replyText.length}/1000</span>
                        <button className={s.submit} disabled={posting || replyText.trim().length === 0}>
                            {posting ? "Отправка…" : "Отправить"}
                        </button>
                    </div>
                    {replyErr && <div className={s.fieldErr}>{replyErr}</div>}
                </form>
            )}

            {/* список ответов */}
            {showReplies && (
                <ul className={s.list} style={{ marginTop: 8 }}>
                    {loadingReplies ? (
                        <div className={s.loading}>Загрузка ответов…</div>
                    ) : (
                        replies.map((r) => (
                            <li key={r.data.id} className={s.item} style={{ marginLeft: 16 }}>
                                <div className={s.header}>
                                    <span className={s.author}>@{r.data.author_username}</span>
                                    <time className={s.time}>{new Date(r.data.created_at).toLocaleString()}</time>
                                </div>
                                <p className={s.content}>{r.data.content}</p>
                                <CommentReactions
                                    commentId={r.data.id}
                                    initialLikes={r.data.likes}
                                    initialDislikes={r.data.dislikes}
                                    initialMyReaction={parseMyReaction(r.user_reaction)}
                                />
                            </li>
                        ))
                    )}
                </ul>
            )}

            {showReplies && hasMoreReplies && (
                <div className={s.moreWrap}>
                    <button className={s.moreBtn} onClick={loadMoreReplies} disabled={loadingMore}>
                        {loadingMore ? "Загрузка…" : "Ещё ответы"}
                    </button>
                    {typeof rTotal === "number" && (
                        <span className={s.totalHint}>Показано {replies.length} из {rTotal}</span>
                    )}
                </div>
            )}
        </li>
    );
}
