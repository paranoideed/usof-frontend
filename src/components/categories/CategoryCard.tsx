import type {CategoryRow} from "@/features/categories/categories.ts";
import { isAdmin } from "@/features/auth/sessions";
import s from "./CategoryCard.module.scss";


export type CategoryCardProps = {
    item: CategoryRow;
    onEdit?: (cat: CategoryRow) => void;
    onDelete?: (cat: CategoryRow) => void;
};


export default function CategoryCard({ item, onEdit, onDelete }: CategoryCardProps) {
    const admin = isAdmin();
    return (
        <div className={s.card}>
            <div className={s.content}>
                <div className={s.head}>
                    <h3 className={s.title}>{item.title}</h3>
                </div>
                <p className={s.desc}>{item.description}</p>
            </div>

            {admin && (
                <div className={s.actions}>
                    <button className={s.edit} onClick={() => onEdit?.(item)}>Edit</button>
                    <button className={s.delete} onClick={() => onDelete?.(item)}>Delete</button>
                </div>
            )}
        </div>
    );
}
