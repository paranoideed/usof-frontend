import s from "@components/posts/PostListFilterPanel.module.scss";

export type CategoryRow = { id: string; title: string };

type Props = {
    q: string;
    onChangeQ: (v: string) => void;

    orderBy: "rating" | "created_at" | "likes" | "dislikes";
    onChangeOrderBy: (v: "rating" | "created_at" | "likes" | "dislikes") => void;

    orderDir: "asc" | "desc";
    onChangeOrderDir: (v: "asc" | "desc") => void;

    categoryId: string;
    onChangeCategoryId: (v: string) => void;

    categories: CategoryRow[];
    catLoading: boolean;
};

export default function PostListFilterPanel(params: Props) {
    return (
        <div className={s.controls}>
            <input
                className={s.filterInput}
                value={params.q}
                onChange={(e) => params.onChangeQ(e.currentTarget.value)}
                placeholder="Search by title"
            />

            <select
                className={s.btn}
                value={params.orderBy}
                onChange={(e) =>
                    params.onChangeOrderBy(e.currentTarget.value as Props["orderBy"])
                }
                title="Sort by"
            >
                <option value="rating">rating</option>
                <option value="likes">likes</option>
                <option value="dislikes">dislikes</option>
                <option value="newest">newest</option>
                <option value="oldest">oldest</option>
            </select>

            <select
                className={s.btn}
                value={params.categoryId}
                onChange={(e) => params.onChangeCategoryId(e.currentTarget.value)}
                disabled={params.catLoading}
                title="Filter by category"
            >
                <option value="">all categories</option>
                {params.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.title}
                    </option>
                ))}
            </select>
        </div>
    );
}
