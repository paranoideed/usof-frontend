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

export default function PostListFilterPanel({
    q,
    onChangeQ,
    orderBy,
    onChangeOrderBy,
    categoryId,
    onChangeCategoryId,
    categories,
    catLoading,
}: Props) {
    return (
        <div className={s.controls}>
            <input
                className={s.filterInput}
                value={q}
                onChange={(e) => onChangeQ(e.currentTarget.value)}
                placeholder="Search by title"
            />

            <select
                className={s.btn}
                value={orderBy}
                onChange={(e) =>
                    onChangeOrderBy(e.currentTarget.value as Props["orderBy"])
                }
                title="Sort by"
            >
                <option value="rating">rating</option>
                <option value="likes">likes</option>
                <option value="dislikes">dislikes</option>
                <option value="newest">newest</option>
                <option value="oldest">oldest</option>
            </select>

            {/*<select*/}
            {/*    className={s.btn}*/}
            {/*    value={orderDir}*/}
            {/*    onChange={(e) => onChangeOrderDir(e.currentTarget.value as "asc" | "desc")}*/}
            {/*    title="Order direction"*/}
            {/*>*/}
            {/*    <option value="desc">desc</option>*/}
            {/*    <option value="asc">asc</option>*/}
            {/*</select>*/}

            <select
                className={s.btn}
                value={categoryId}
                onChange={(e) => onChangeCategoryId(e.currentTarget.value)}
                disabled={catLoading}
                title="Filter by category"
            >
                <option value="">all categories</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.title}
                    </option>
                ))}
            </select>
        </div>
    );
}
