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

export default function PostsList(params: Props) {
    return (
        <div>
            <div className={s.list}>
                {params.items.map((p) => (
                    <PostSmall key={p.data.id} post={p} />
                ))}
            </div>

            <div className={s.loader}>
                {params.loading && <div>Loading…</div>}
                {!params.loading && params.hasMore && (
                    <SecondButton onClick={params.loadMore}>Show More</SecondButton>
                )}

                {!params.loading && !params.hasMore && params.items.length > 0 && <div>No more posts</div>}
            </div>
        </div>
    )
}