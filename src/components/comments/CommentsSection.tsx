import * as React from "react";
import { z } from "zod";

import Button from "@components/ui/Button.tsx";
import CommentThread from "@components/comments/CommentThread.tsx";

import { createComment } from "@features/comments/create.ts";
import { getCurrentUserId } from "@/features/auth/sessions";
import { fetchCommentsByParent } from "@features/comments/list.ts";

import type { Comment } from "@features/comments/comment.ts";

import s from "./CommentsSection.module.scss";
import LoginRequiredModal from "@components/ui/LoginRequiredModal.tsx";

type ReplyTarget = {
    postId: string;
    parent: Comment;
    onCreated?: (c: Comment) => void;
} | null;

type ReplyCtx = {
    target: ReplyTarget;
    open: (t: ReplyTarget) => void;
    close: () => void;
};

export const ReplyContext = React.createContext<ReplyCtx>({
    target: null,
    open: () => {},
    close: () => {},
});

const ContentSchema = z.string().min(1, "Пустой комментарий").max(1000, "Слишком длинно");
const PAGE_SIZE = 10;

type Props = { postId: string };

export default function CommentsSection({ postId }: Props) {
    const [items, setItems] = React.useState<Comment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    const [offset, setOffset] = React.useState(0);
    const [total, setTotal] = React.useState<number | null>(null);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const [replyTarget, setReplyTarget] = React.useState<ReplyTarget>(null);
    const [replyValue, setReplyValue] = React.useState("");
    const [replyErr, setReplyErr] = React.useState<string | null>(null);
    const [posting, setPosting] = React.useState(false);
    const [loginOpen, setLoginOpen] = React.useState(false);

    const meId = getCurrentUserId();
    const hasMore = total !== null
        ? items.length < total
        : items.length % PAGE_SIZE === 0 && items.length !== 0;

    React.useEffect(() => {
        let ignore = false;
        setLoading(true); setErr(null); setItems([]); setOffset(0); setTotal(null);

        (async () => {
            try {
                const res = await fetchCommentsByParent(postId, null, PAGE_SIZE, 0);
                setItems((res.data ?? []).map(d => ({ data: d })));
                setTotal(res.meta.total);
                setOffset((res.meta.offset ?? 0) + (res.meta.limit ?? PAGE_SIZE));
            } catch (e: any) {
                if (!ignore) setErr(e?.message ?? "Failed to load comments");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => { ignore = true; };
    }, [postId]);

    function ensureAuth(): boolean {
        if (!meId) {
            setLoginOpen(true);
            return false;
        }
        return true;
    }

    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchCommentsByParent(postId, null, PAGE_SIZE, offset);
            setItems(prev => [...prev, ...((res.data ?? []).map(d => ({ data: d })))]);
            setTotal(res.meta.total);
            setOffset((res.meta.offset ?? offset) + (res.meta.limit ?? PAGE_SIZE));
        } finally { setLoadingMore(false); }
    };

    const openReply: ReplyCtx["open"] = (t) => {
        if (!t) return;
        setReplyTarget(t);
        setReplyErr(null);
        setReplyValue("");
    };
    const closeReply = () => {
        setReplyTarget(null);
        setReplyErr(null);
        setReplyValue("");
    };

    const submitReply = async (e: React.FormEvent) => {
        e.preventDefault();              // ← перенесли вверх
        if (!ensureAuth()) return;       // ← теперь модалка откроется без сабмита формы

        if (!replyTarget) return;

        setReplyErr(null);
        const parsed = ContentSchema.safeParse(replyValue.trim());
        if (!parsed.success) {
            setReplyErr(parsed.error.issues[0]?.message ?? "Invalid content");
            return;
        }

        const authorId = getCurrentUserId();
        if (!authorId) { setReplyErr("U need to login for response"); return; }

        setPosting(true);
        try {
            const created = await createComment({
                post_id: replyTarget.postId,
                author_id: authorId,
                parent_id: replyTarget.parent.data.id,
                content: parsed.data,
            });

            replyTarget.onCreated?.(created);
            closeReply();
        } catch (e: any) {
            setReplyErr(e?.response?.data?.error ?? e?.message ?? "Failed to send reply");
        } finally {
            setPosting(false);
        }
    };

    const requireLogin = React.useCallback(() => setLoginOpen(true), []);

    return (
        <ReplyContext.Provider value={{ target: replyTarget, open: openReply, close: closeReply }}>
            <div className={s.root}>
                <h3 className={s.title}>Comments</h3>

                {meId && <RootComposer
                    postId={postId}
                    onCreated={(created) => {
                        setItems((prev) => [created, ...prev]);
                        setTotal((t) => (typeof t === "number" ? t + 1 : t));
                    }}
                    requireLogin={requireLogin}
                />}

                {loading ? (
                    <div className={s.loading}>Loading…</div>
                ) : err ? (
                    <div className={s.error}>Error: {err}</div>
                ) : items.length === 0 ? (
                    <div className={s.empty}>No comments</div>
                ) : (
                    <>
                        <ul className={s.list}>
                            {items.map((c) => (
                                <CommentThread
                                    key={c.data.id}
                                    postId={postId}
                                    comment={c}
                                    replies={c.data.attributes.replies_count}
                                    onDeleted={(id) => {
                                        setItems((prev) => prev.filter((x) => x.data.id !== id));
                                        setTotal((t) => (typeof t === "number" ? Math.max(0, t - 1) : t));
                                    }}
                                />
                            ))}
                        </ul>

                        {hasMore && (
                            <div className={s.moreWrap}>
                                <div>
                                    <Button onClick={loadMore} disabled={loadingMore}>
                                        {loadingMore ? "Loading…" : "More"}
                                    </Button>
                                </div>
                                {typeof total === "number" && (
                                    <span className={s.totalHint}>
                                        Показано {items.length} из {total}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}

                {replyTarget && (
                    <form className={s.replyDock} onSubmit={submitReply}>
                        <div className={s.replyDockHeader}>
                            <span className={s.replyDockTitle}>
                                Replying to <strong>@{replyTarget.parent.data.attributes.author_username}</strong>
                            </span>
                            <button type="button" className={s.replyDockClose} onClick={closeReply} aria-label="Close reply">
                                ✕
                            </button>
                        </div>
                        <textarea
                            className={s.textarea}
                            value={replyValue}
                            onChange={(e) => setReplyValue(e.currentTarget.value)}
                            placeholder="Write your reply…"
                            maxLength={1000}
                            rows={3}
                        />
                        <div className={s.formBar}>
                            <span className={s.counter}>{replyValue.length}/1000</span>
                            <div>
                                <Button className={s.submit} disabled={posting || replyValue.trim().length === 0}>
                                    {posting ? "Sending…" : "Send"}
                                </Button>
                            </div>
                        </div>
                        {replyErr && <div className={s.fieldErr}>{replyErr}</div>}
                    </form>
                )}

                <LoginRequiredModal open={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>
        </ReplyContext.Provider>
    );
}

function RootComposer({
    postId,
    onCreated,
    requireLogin,                           // ← новый проп
}: {
    postId: string;
    onCreated: (c: Comment) => void;
    requireLogin: () => void;
}) {
    const [value, setValue] = React.useState("");
    const [posting, setPosting] = React.useState(false);
    const [fieldErr, setFieldErr] = React.useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();                   // ← всегда отменяем дефолт
        setFieldErr(null);

        const parsed = ContentSchema.safeParse(value.trim());
        if (!parsed.success) {
            setFieldErr(parsed.error.issues[0]?.message ?? "Неверный текст");
            return;
        }

        const authorId = getCurrentUserId();
        if (!authorId) {
            requireLogin();                     // ← открываем модалку
            return;
        }

        setPosting(true);
        try {
            const created = await createComment({
                post_id: postId,
                author_id: authorId,
                content: parsed.data,
            });
            onCreated(created);
            setValue("");
        } catch (e: any) {
            setFieldErr(e?.response?.data?.error ?? e?.message ?? "Не удалось отправить комментарий");
        } finally {
            setPosting(false);
        }
    };

    return (
        <form className={s.form} onSubmit={onSubmit}>
            <textarea
                className={s.textarea}
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                placeholder="Write comment…"
                maxLength={1000}
                rows={4}
            />
            <div className={s.formBar}>
                <span className={s.counter}>{value.length}/1000</span>
                <div>
                    <Button className={s.submit} disabled={posting || value.trim().length === 0}>
                        {posting ? "Sending…" : "Send"}
                    </Button>
                </div>
            </div>
            {fieldErr && <div className={s.fieldErr}>{fieldErr}</div>}
        </form>
    );
}
