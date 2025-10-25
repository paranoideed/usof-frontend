import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { isAdmin } from "@/features/auth/sessions";
import getCategory from "@features/categories/get";
import { updateCategory } from "@features/categories/update";
import { createCategory } from "@features/categories/create";

type FormState = {
    title: string;
    description: string;
};

export default function useCategoryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const admin = isAdmin();
    const editing = Boolean(id);

    const [values, setValues] = React.useState<FormState>({ title: "", description: "" });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!admin) navigate("/categories");
    }, [admin, navigate]);

    React.useEffect(() => {
        if (!editing || !id) return;
        let mounted = true;

        setLoading(true);
        setError(null);
        getCategory(id)
            .then(cat => {
                if (!mounted) return;
                setValues({
                    title: cat.data.attributes.title ?? "",
                    description: cat.data.attributes.description ?? "",
                });
            })
            .catch((e: any) => {
                if (mounted) setError(e?.message || String(e));
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, [editing, id]);

    const onChange = React.useCallback(<K extends keyof FormState>(key: K, v: FormState[K]) => {
        setValues(prev => ({ ...prev, [key]: v }));
    }, []);

    const onSubmit = React.useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault?.();
        setError(null);

        const title = values.title.trim();
        if (!title) {
            setError("Title is required");
            return;
        }

        setLoading(true);
        try {
            if (editing && id) {
                await updateCategory({
                    categoryId: id,
                    title: values.title,
                    description: values.description,
                });
            } else {
                await createCategory({
                    title: values.title,
                    description: values.description,
                });
            }
            navigate("/categories");
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [editing, id, navigate, values]);

    return {
        admin,
        editing,
        values,
        loading,
        error,
        onChange,
        onSubmit,
    };
}
