import React from "react";
import { useNavigate, Link } from "react-router-dom";

import NavBar from "@components/ui/NavBar.tsx";
import CategoryGrid from "@/components/categories/CategoryGrid";

import { isAdmin } from "@/features/auth/sessions";
import { listCategories } from "@features/categories/list.ts";
import { deleteCategory } from "@features/categories/delete.ts";

import type {Category} from "@features/categories/types.ts";

import s from "./CategoriesPage.module.scss";

const PAGE_SIZE = 20; // сколько карточек грузим за раз

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
                const items = res.data ?? [];
                const total = res.total ?? items.length;
                setAll(items);
                setVisible(items.slice(0, Math.min(items.length, PAGE_SIZE)));
                setHasMore(total > PAGE_SIZE);
            })
            .catch((e: any) => setError(e?.message || String(e)))
            .finally(() => setLoading(false));

        return () => { mounted = false; };
    }, []);

    function onLoadMore() {
        if (all.length > visible.length) {
            setVisible(all.slice(0, visible.length + PAGE_SIZE));
            setHasMore(all.length > visible.length + PAGE_SIZE);
        } else {
            listCategories({ offset: visible.length, limit: PAGE_SIZE }).then((res) => {
                const next = [...visible, ...res.data];
                setAll((prev) => [...prev, ...res.data]);
                setVisible(next);
                const total = res.total ?? next.length;
                setHasMore(total > next.length);
            }).catch(() => {});
        }
    }

    async function handleDelete(cat: Category) {
        if (!confirm(`Delete category «${cat.title}»?`)) return;
        const prev = visible;
        setVisible((v) => v.filter((x) => x.id !== cat.id));
        try {
            await deleteCategory(cat.id);
        } catch (e) {
            // откат
            setVisible(prev);
            alert((e as any)?.message || e);
        }
    }

    function handleEdit(cat: Category) {
        navigate(`/categories/${cat.id}/edit`);
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
                    <Link className={s.createBtn} to="/categories/create">
                        Create New
                    </Link>
                )}
            </div>
        </div>
    );
}
