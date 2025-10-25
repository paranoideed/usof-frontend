import PostSmall from "@components/posts/PostSmall.tsx";
import SecondButton from "@components/ui/SecondButton.tsx";

import type {Post} from "@features/posts/post.ts";

import s from "@components/posts/PostsList.module.scss";

type Props = {
    items: Post[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
}

export default function PostsList({ items, loading, hasMore, loadMore }: Props) {
    return (
        <div>
            <div className={s.list}>
                {items.map((p) => (
                    <PostSmall key={p.data.id} post={p} />
                ))}
            </div>

            <div className={s.loader}>
                {loading && <div>Loading…</div>}
                {!loading && hasMore && (
                    <SecondButton onClick={loadMore}>Show More</SecondButton>
                )}

                {!loading && !hasMore && items.length > 0 && <div>No more posts</div>}
            </div>
        </div>
    )
}