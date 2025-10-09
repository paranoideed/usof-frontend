// CategoryFormPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCategory, updateCategory, listCategories } from "@/features/categories/categories.ts";
import { isAdmin } from "@/features/auth/sessions";
import s from "./CategoryFormPage.module.scss";

export default function CategoryFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const admin = isAdmin();
    const editing = Boolean(id);

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!editing) return;
        setLoading(true);
        listCategories({ offset: 0, limit: 100 })
            .then((res) => {
                const found = res.data.find((x) => x.id === id);
                if (found) {
                    setTitle(found.title);
                    setDescription(found.description);
                } else {
                    setError("Категория не найдена");
                }
            })
            .catch((e) => setError(e?.message || String(e)))
            .finally(() => setLoading(false));
    }, [editing, id]);

    React.useEffect(() => {
        if (!admin) navigate("/categories");
    }, [admin, navigate]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!title.trim()) return setError("Введите название");
        setLoading(true);
        try {
            if (editing && id) await updateCategory({ id, title, description });
            else await createCategory({ title, description });
            navigate("/categories");
        } catch (e) {
            setError((e as any)?.message || String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={s.page}>
            <div className={s.header}>
                <h1 className={s.h1}>{editing ? "Изменить категорию" : "Создать категорию"}</h1>
                <button type="button" className={s.backBtn} onClick={() => navigate(-1)}>Назад</button>
            </div>

            <div className={s.card}>
                {error && <div className={s.alert}>{error}</div>}

                <form className={s.form} onSubmit={onSubmit}>
                    <label className={s.field}>
                        <span className={s.label}>Название</span>
                        <input
                            className={s.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введите название"
                            maxLength={64}
                        />
                    </label>

                    <label className={s.field}>
                        <span className={s.label}>Описание</span>
                        <textarea
                            className={s.input}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Коротко о категории"
                            rows={5}
                            maxLength={1024}
                        />
                        <span className={s.hint}>До 1024 символов</span>
                    </label>

                    <div className={s.actions}>
                        <button type="submit" className={s.primary} disabled={loading}>
                            {loading ? "Сохранение…" : "Сохранить"}
                        </button>
                        <button type="button" className={s.ghost} onClick={() => navigate(-1)} disabled={loading}>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
