import React from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "@components/ui/NavBar.tsx";
import CategoryGrid from "@/components/categories/CategoryGrid";

import { isAdmin } from "@/features/auth/sessions";
import { listCategories } from "@features/categories/list.ts";
import { deleteCategory } from "@features/categories/delete.ts";

import type { Category } from "@features/categories/category.ts";

import s from "./CategoriesPage.module.scss";
import Fab from "@components/ui/Fab.tsx";

const PAGE_SIZE = 20;

export default function CategoriesPage() {
    const [all, setAll] = React.useState<Category[]>([]);
    const [visible, setVisible] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [hasMore, setHasMore] = React.useState(false);
    const admin = isAdmin();
    const navigate = useNavigate();

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        listCategories({ offset: 0, limit: PAGE_SIZE })
            .then((res) => {
                if (!mounted) return;

                const items: Category[] = (res.data ?? []).map(d => ({ data: d }));

                const total = res.meta?.total ?? items.length;
                setAll(items);
                setVisible(items.slice(0, Math.min(items.length, PAGE_SIZE)));
                setHasMore(total > PAGE_SIZE);
            })
            .catch((e: any) => { if (mounted) setError(e?.message || String(e)); })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, []);


    async function onLoadMore() {
        if (all.length > visible.length) {
            const nextVisible = all.slice(0, visible.length + PAGE_SIZE);
            setVisible(nextVisible);
            setHasMore(all.length > nextVisible.length);
            return;
        }

        setLoading(true);
        try {
            const res = await listCategories({ offset: visible.length, limit: PAGE_SIZE });

            const newItems: Category[] = (res.data ?? []).map(d => ({ data: d }));

            const next = [...visible, ...newItems];

            setAll(prev => [...prev, ...newItems]);
            setVisible(next);

            const total = res.meta?.total ?? next.length;
            setHasMore(total > next.length);
        } catch (_) {
            // можно показать тост/ошибку
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(cat: Category) {
        const name = cat.data.attributes?.title ?? "category";
        if (!confirm(`Delete category «${name}»?`)) return;
        const prev = visible;
        setVisible((v) => v.filter((x) => x.data.id !== cat.data.id));
        try {
            await deleteCategory(cat.data.id);
        } catch (e) {
            setVisible(prev);
            alert((e as any)?.message || e);
        }
    }


    function handleEdit(cat: Category) {
        navigate(`/categories/${cat.data.id}/edit`);
    }

    return (
        <div className={s.wrap}>
            <NavBar />

            <div className={s.topbar}>
                <h2>Categories</h2>
            </div>

            {error && <div className={s.error}>⚠️ {error}</div>}

            <section className={s.container}>
                <CategoryGrid items={visible} onEdit={handleEdit} onDelete={handleDelete} />
            </section>

            <div className={s.footer}>
                {hasMore && (
                    <button
                        className={s.moreBtn}
                        onClick={onLoadMore}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "More..."}
                    </button>
                )}
                {admin && (
                    <Fab
                        onClick={() => navigate("/categories/create")}
                        title="Create post"
                    />
                )}
            </div>
        </div>
    );
}
