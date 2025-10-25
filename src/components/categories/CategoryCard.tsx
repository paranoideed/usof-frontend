import { useNavigate } from "react-router-dom";

import { isAdmin } from "@/features/auth/sessions";

import type { Category } from "@/features/categories/category";

import s from "./CategoryCard.module.scss";

export type CategoryCardProps = {
    item: Category;
    onEdit?: (cat: Category) => void;
    onDelete?: (cat: Category) => void;
};

export default function CategoryCard({ item, onEdit, onDelete }: CategoryCardProps) {
    const admin = isAdmin();
    const navigate = useNavigate();

    const goToPosts = () => navigate(`/posts?category=${encodeURIComponent(item.data.id)}`);

    return (
        <div className={s.card} role="button" tabIndex={0} onClick={goToPosts} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToPosts(); }
        }}>
            <div className={s.content}>
                <div className={s.head}>
                    <h3 className={s.title}>{item.data.attributes.title}</h3>
                </div>
                <p className={s.desc}>{item.data.attributes.description}</p>
            </div>

            {admin && (
                <div className={s.actions} onClick={(e) => e.stopPropagation()}>
                    <button className={s.edit} onClick={() => onEdit?.(item)}>Edit</button>
                    <button className={s.delete} onClick={() => onDelete?.(item)}>Delete</button>
                </div>
            )}
        </div>
    );
}
