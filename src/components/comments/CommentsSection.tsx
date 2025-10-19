import * as React from "react";
import { z } from "zod";
import { getCurrentUserId } from "@/features/auth/sessions";
import s from "./style/comments.module.scss";
import CommentThread from "@components/comments/CommentThread.tsx";
import {fetchCommentsByParent} from "@features/comments/fetched.ts";
import {createComment} from "@features/comments/create.ts";
import type { Comment } from "@features/comments/types";
import Button from "@components/ui/Button.tsx";

type Props = { postId: string };

const ContentSchema = z.string().min(1, "Пустой комментарий").max(1000, "Слишком длинно");
const PAGE_SIZE = 10;

export default function CommentsSection({ postId }: Props) {
    const [items, setItems] = React.useState<Comment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState<string | null>(null);

    const [value, setValue] = React.useState("");
    const [posting, setPosting] = React.useState(false);
    const [fieldErr, setFieldErr] = React.useState<string | null>(null);

    const [offset, setOffset] = React.useState(0);
    const [total, setTotal] = React.useState<number | null>(null);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const hasMore = total !== null
        ? items.length < total
        : items.length % PAGE_SIZE === 0 && items.length !== 0; // эвристика если total нет

    // начальная загрузка
    React.useEffect(() => {
        let ignore = false;
        setLoading(true); setErr(null); setItems([]); setOffset(0); setTotal(null);

        (async () => {
            try {
                const res = await fetchCommentsByParent(postId, null, PAGE_SIZE, 0);
                if (ignore) return;
                setItems(res.data ?? []);
                if (typeof res.total === "number") setTotal(res.total);
                setOffset((res.offset ?? 0) + (res.limit ?? PAGE_SIZE));
            } catch (e: any) {
                if (!ignore) setErr(e?.message ?? "Не удалось загрузить комментарии");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [postId]);

    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchCommentsByParent(postId, null, PAGE_SIZE, offset);
            setItems((prev) => [...prev, ...(res.data ?? [])]);
            if (typeof res.total === "number") setTotal(res.total);
            setOffset((res.offset ?? offset) + (res.limit ?? PAGE_SIZE));
        } finally { setLoadingMore(false); }
    };

    // отправка нового коммента
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErr(null);

        const parsed = ContentSchema.safeParse(value.trim());
        if (!parsed.success) {
            setFieldErr(parsed.error.issues[0]?.message ?? "Неверный текст");
            return;
        }

        const authorId = getCurrentUserId();
        if (!authorId) {
            setFieldErr("Нужно войти, чтобы комментировать");
            return;
        }

        setPosting(true);
        try {
            const created = await createComment({
                post_id: postId,
                author_id: authorId,
                parent_id: null,
                content: parsed.data,
            });
            // добавим в начало списка
            setItems((prev) => [created, ...prev]);
            // если есть total — увеличим
            setTotal((t) => (typeof t === "number" ? t + 1 : t));
            setValue("");
        } catch (e: any) {
            setFieldErr(e?.response?.data?.error ?? e?.message ?? "Не удалось отправить комментарий");
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className={s.root}>
            <h3 className={s.title}>Comments</h3>

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

            {/* список */}
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
        </div>
    );
}
