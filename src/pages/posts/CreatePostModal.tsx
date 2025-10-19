import * as React from "react";
import s from "./CreatePostModal.module.scss";
import { getCurrentUserId } from "@features/auth/sessions.ts";
import Button from "@components/ui/Button.tsx";
import clsx from "clsx";
import {createPost} from "@features/posts/create.ts";
import type {Category, ListCategories} from "@features/categories/types.ts";
import {listCategories} from "@features/categories/list.ts";

type Props = { open: boolean; onClose: () => void; onCreated?: () => void };
type FieldErrors = { common?: string; title?: string; content?: string; categories?: string };

export default function CreatePostModal({ open, onClose, onCreated }: Props) {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [categories, setCategories] = React.useState<string[]>([]);
    const [cats, setCats] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<FieldErrors>({});
    const [catsOpen, setCatsOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                setCats(await listCategories({}).then((res: ListCategories) => res.data) );
            } catch {
                /* no-op */
            }
        })();
    }, [open]);

    if (!open) return null;

    const toggleCat = (id: string) =>
        setCategories((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const validate = () => {
        const next: FieldErrors = {};

        if (!title.trim()) next.title = "Create a title";
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
            const uid = getCurrentUserId();
            if (!uid) {
                setErrors({ common: "Unauthorized" });
                return;
            }

            await createPost({
                author_id: uid,
                title,
                content,
                categories: categories.slice(0, 5),
            });

            onClose();
            onCreated?.();

            setTitle("");
            setContent("");
            setCategories([]);
            setCatsOpen(false);
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
                    <div className={s.title}>New post</div>
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
                            placeholder="What is your post about?"
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
                            placeholder="Write something useful..."
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
                                    <label key={c.id} className={s.catItem}>
                                        <input
                                            type="checkbox"
                                            checked={categories.includes(c.id)}
                                            onChange={() => toggleCat(c.id)}
                                        />{" "}
                                        {c.title}
                                    </label>
                                ))}
                                {cats.length === 0 && <div className={s.hint}>Категории не найдены</div>}
                            </div>
                        </div>
                    </div>

                    <div className={s.footer}>
                        <Button type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
