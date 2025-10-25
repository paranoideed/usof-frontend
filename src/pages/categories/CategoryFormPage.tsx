import useCategoryForm from "@/pages/categories/hooks/useCategoryForm";
import Button from "@components/ui/Button.tsx";
import s from "./CategoryFormPage.module.scss";

export default function CategoryFormPage() {
    const { editing, values, loading, error, onChange, onSubmit } = useCategoryForm();

    return (
        <div className={s.page}>
            <div className={s.header}>
                <h1 className={s.h1}>{editing ? "Change category" : "Create category"}</h1>
                <button type="button" className={s.backBtn} onClick={() => history.back()} disabled={loading}>
                    Back
                </button>
            </div>

            <div className={s.card}>
                {error && <div className={s.alert}>{error}</div>}

                <form className={s.form} onSubmit={onSubmit}>
                    <label className={s.field}>
                        <span className={s.label}>Title</span>
                        <input
                            className={s.input}
                            value={values.title}
                            onChange={(e) => onChange("title", e.target.value)}
                            placeholder="Title of the category"
                            maxLength={64}
                            disabled={loading}
                        />
                    </label>

                    <label className={s.field}>
                        <span className={s.label}>Description</span>
                        <textarea
                            className={s.input}
                            value={values.description}
                            onChange={(e) => onChange("description", e.target.value)}
                            placeholder="Description of the category"
                            rows={5}
                            maxLength={1024}
                            disabled={loading}
                        />
                        <span className={s.hint}>Not more than 1024</span>
                    </label>

                    <div className={s.actions}>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Save…" : "Save"}
                        </Button>

                        <Button type="button" onClick={() => history.back()} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
