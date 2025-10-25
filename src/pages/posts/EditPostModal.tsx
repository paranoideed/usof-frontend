import * as React from "react";
import clsx from "clsx";

import Button from "@components/ui/Button.tsx";

import { updatePost } from "@features/posts/update.ts";
import { listCategories } from "@features/categories/list.ts";

import s from "./CreatePostModal.module.scss";
import type {Category} from "@features/categories/category.ts";
import type {Post} from "@features/posts/post.ts";

type Props = {
    open: boolean;
    onClose: () => void;
    onUpdated?: (updated: Post) => void; // <-- изменили сигнатуру
    postId: string;
    initialTitle: string;
    initialContent: string;
    initialCategories: { id: string; title: string }[] | string[];
};

type FieldErrors = { common?: string; title?: string; content?: string; categories?: string };

export default function EditPostModal({
        open,
        onClose,
        onUpdated,
        postId,
        initialTitle,
        initialContent,
        initialCategories,
    }: Props) {
    const [title, setTitle] = React.useState(initialTitle);
    const [content, setContent] = React.useState(initialContent);
    const [categories, setCategories] = React.useState<string[]>(
        Array.isArray(initialCategories)
            ? (typeof initialCategories[0] === "string"
                ? (initialCategories as string[])
                : (initialCategories as { id: string }[]).map((c) => c.id))
            : []
    );
    const [cats, setCats] = React.useState<Category[]>([]);
    const [catsOpen, setCatsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<FieldErrors>({});

    React.useEffect(() => {
        if (!open) return;

        let mounted = true;
        (async () => {
            try {
                const res = await listCategories({ limit: 100, offset: 0 });
                const items: Category[] = (res.data ?? []).map(d => ({ data: d }));
                if (mounted) setCats(items);
            } catch {
            }
        })();

        return () => { mounted = false; };
    }, [open]);


    React.useEffect(() => {
        if (!open) return;
        setTitle(initialTitle);
        setContent(initialContent);
        const arr = Array.isArray(initialCategories)
            ? (typeof initialCategories[0] === "string"
                ? (initialCategories as string[])
                : (initialCategories as { id: string }[]).map((c) => c.id))
            : [];
        setCategories(arr);
    }, [open, initialTitle, initialContent, initialCategories]);

    if (!open) return null;

    const toggleCat = (id: string) =>
        setCategories((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const validate = () => {
        const next: FieldErrors = {};
        if (!title.trim()) next.title = "Title is required";
        if (!content.trim()) next.content = "Content cannot be empty";
        if (categories.length === 0) next.categories = "Select at least one category";
        if (categories.length > 5) next.categories = "You can select up to 5 categories";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) return;

        setLoading(true);
        try {
            const updated = await updatePost({
                id: postId,
                title,
                content,
                categories: categories.slice(0, 5),
            });

            onClose();
            onUpdated?.(updated); // <-- отдаём весь пост наверх
        } catch (err: any) {
            setErrors({ common: err?.response?.data?.error || err?.message || "Internal Error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.backdrop} onClick={onClose}>
            <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                <div className={s.header}>
                    <div className={s.title}>Edit post</div>
                    <button className={s.close} onClick={onClose}>×</button>
                </div>

                <form className={s.form} onSubmit={onSubmit} noValidate>
                    {(errors.common || errors.categories) && (
                        <div className={s.err}>{errors.common || errors.categories}</div>
                    )}

                    <div className={s.row}>
                        <label htmlFor="post-title">Title</label>
                        <input
                            id="post-title"
                            className={clsx(s.input, errors.title && s.invalid)}
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            placeholder="Update the title"
                            maxLength={256}
                        />
                        {errors.title && <div className={s.errSmall}>{errors.title}</div>}
                    </div>

                    <div className={s.row}>
                        <label htmlFor="post-content">Content</label>
                        <textarea
                            id="post-content"
                            className={clsx(s.textarea, errors.content && s.invalid)}
                            value={content}
                            onChange={(e) => setContent(e.currentTarget.value)}
                            rows={8}
                            placeholder="Update the content…"
                        />
                        {errors.content && <div className={s.errSmall}>{errors.content}</div>}
                    </div>

                    <div className={s.row}>
                        <div className={s.catsHeader}>
                            <button
                                type="button"
                                className={s.buttonCategory}
                                onClick={() => setCatsOpen((v) => !v)}
                                aria-expanded={catsOpen}
                                aria-controls="cats-panel"
                            >
                                Category {categories.length ? `(${categories.length})` : ""}
                                <span className={clsx(s.caret, catsOpen && s.caretOpen)} />
                            </button>
                            {errors.categories && <div className={s.errSmall}>{errors.categories}</div>}
                        </div>

                        <div
                            id="cats-panel"
                            className={clsx(s.catsWrapper, catsOpen && s.catsOpen)}
                            role="region"
                            aria-hidden={!catsOpen}
                        >
                            <div className={s.cats}>
                                {cats.map((c) => (
                                    <label key={c.data.id} className={s.catItem}>
                                        <input
                                            type="checkbox"
                                            checked={categories.includes(c.data.id)}
                                            onChange={() => toggleCat(c.data.id)}
                                        />{" "}
                                        {c.data.attributes.title}
                                    </label>
                                ))}
                                {cats.length === 0 && <div className={s.hint}>No categories found</div>}
                            </div>
                        </div>
                    </div>

                    <div className={s.footer}>
                        <Button type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
