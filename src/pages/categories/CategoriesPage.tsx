import { useNavigate } from "react-router-dom";

import Fab from "@components/ui/Fab.tsx";
import NavBar from "@components/ui/NavBar.tsx";
import CategoryGrid from "@/components/categories/CategoryGrid";

import { isAdmin } from "@/features/auth/sessions";
import { deleteCategory } from "@features/categories/delete";
import type { Category } from "@features/categories/category";

import useCategoriesFeed from "@/pages/categories/hooks/useCategoriesFeed"; // <-- НЕ type-импорт!

import s from "./CategoriesPage.module.scss";

export default function CategoriesPage() {
    const admin = isAdmin();
    const navigate = useNavigate();

    const {
        visible,
        loading,
        error,
        hasMore,
        loadMore,
        removeLocally,
        setVisible,
    } = useCategoriesFeed(15);

    async function handleDelete(cat: Category) {
        const name = cat.data.attributes?.title ?? "category";
        if (!confirm(`Delete category «${name}»?`)) return;

        const prev = visible;
        removeLocally(cat.data.id);

        try {
            await deleteCategory(cat.data.id);
        } catch (e: any) {
            setVisible(prev);
            alert(e?.message || String(e));
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
                    <button className={s.moreBtn} onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "More..."}
                    </button>
                )}
                {admin && (
                    <Fab onClick={() => navigate("/categories/create")} title="Create post" />
                )}
            </div>
        </div>
    );
}
