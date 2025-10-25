import CategoryCard from "@/components/categories/CategoryCard";

import type { Category } from "@/features/categories/category";

import s from "./CategoryGrid.module.scss";


export type CategoryGridProps = {
    items: Category[];
    onEdit?: (c: Category) => void;
    onDelete?: (c: Category) => void;
};

export default function CategoryGrid({ items, onEdit, onDelete }: CategoryGridProps) {
    return (
        <div className={s.grid}>
            {items.map((it) => (
                <CategoryCard key={it.data.id} item={it} onEdit={onEdit} onDelete={onDelete} />)
            )}
        </div>
    );
}