import * as React from "react";
import { z } from "zod";
import { createComment, fetchComments, type Comment } from "@/features/comments/comments";
import { getCurrentUserId } from "@/features/auth/sessions";
import s from "./CommentsSection.module.scss";

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
        setLoading(true);
        setErr(null);
        setItems([]);
        setOffset(0);
        setTotal(null);

        (async () => {
            try {
                const res = await fetchComments(postId, PAGE_SIZE, 0);
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

    // догрузка “Ещё”
    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await fetchComments(postId, PAGE_SIZE, offset);
            setItems((prev) => [...prev, ...(res.data ?? [])]);
            if (typeof res.total === "number") setTotal(res.total);
            setOffset((res.offset ?? offset) + (res.limit ?? PAGE_SIZE));
        } catch (e: any) {
            // показывать общий тост не будем — не критично
        } finally {
            setLoadingMore(false);
        }
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
            <h3 className={s.title}>Комментарии</h3>

            {/* форма */}
            <form className={s.form} onSubmit={onSubmit}>
        <textarea
            className={s.textarea}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="Напишите комментарий…"
            maxLength={1000}
            rows={4}
        />
                <div className={s.formBar}>
                    <span className={s.counter}>{value.length}/1000</span>
                    <button className={s.submit} disabled={posting || value.trim().length === 0}>
                        {posting ? "Отправка…" : "Отправить"}
                    </button>
                </div>
                {fieldErr && <div className={s.fieldErr}>{fieldErr}</div>}
            </form>

            {/* список */}
            {loading ? (
                <div className={s.loading}>Загрузка…</div>
            ) : err ? (
                <div className={s.error}>Ошибка: {err}</div>
            ) : items.length === 0 ? (
                <div className={s.empty}>Пока нет комментариев</div>
            ) : (
                <>
                    <ul className={s.list}>
                        {items.map((c) => (
                            <li key={c.data.id} className={s.item}>
                                <div className={s.header}>
                                    <span className={s.author}>@{c.data.author_username}</span>
                                    <time className={s.time}>
                                        {new Date(c.data.created_at).toLocaleString()}
                                    </time>
                                </div>
                                <p className={s.content}>{c.data.content}</p>
                            </li>
                        ))}
                    </ul>

                    {hasMore && (
                        <div className={s.moreWrap}>
                            <button className={s.moreBtn} onClick={loadMore} disabled={loadingMore}>
                                {loadingMore ? "Загрузка…" : "Ещё"}
                            </button>
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
