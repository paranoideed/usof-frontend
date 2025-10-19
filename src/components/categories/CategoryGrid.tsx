import type {Category} from "@/features/categories/categories";
import CategoryCard from "./CategoryCard";
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
                <CategoryCard key={it.id} item={it} onEdit={onEdit} onDelete={onDelete} />)
            )}
        </div>
    );
}