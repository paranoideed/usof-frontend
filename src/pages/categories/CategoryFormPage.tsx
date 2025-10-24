import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { isAdmin } from "@/features/auth/sessions";
import { updateCategory } from "@features/categories/update.ts";
import { createCategory } from "@features/categories/create.ts";
import getCategory from "@features/categories/get.ts";

import Button from "@components/ui/Button.tsx";

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
        if (!editing || !id) return;
        setLoading(true);
        getCategory(id)
            .then((cat) => {
                setTitle(cat.title ?? "");
                setDescription(cat.description ?? "");
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
        if (!title.trim()) return setError("Title is required");
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
                <h1 className={s.h1}>{editing ? "Change category" : "Create category"}</h1>
                <button type="button" className={s.backBtn} onClick={() => navigate(-1)}>Back</button>
            </div>

            <div className={s.card}>
                {error && <div className={s.alert}>{error}</div>}

                <form className={s.form} onSubmit={onSubmit}>
                    <label className={s.field}>
                        <span className={s.label}>Title</span>
                        <input
                            className={s.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title of the category"
                            maxLength={64}
                        />
                    </label>

                    <label className={s.field}>
                        <span className={s.label}>Description</span>
                        <textarea
                            className={s.input}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description of the category"
                            rows={5}
                            maxLength={1024}
                        />
                        <span className={s.hint}>Not more than 10000</span>
                    </label>

                    <div className={s.actions}>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Save…" : "Save"}
                        </Button>

                        <Button type="button" onClick={() => navigate(-1)} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
