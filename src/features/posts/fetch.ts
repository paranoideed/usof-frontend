import {api} from "@features/client.ts";
import type {PostsList, PostStatus} from "@features/posts/posts.ts";


export type ListPostsParams = {
    author_id?:       string;
    author_username?: string;
    status?:          PostStatus;
    title?:           string;
    category_id?:     string;
    order_by?:  "created_at" | "updated_at" | "likes" | "dislikes" | "rating";
    order_dir?: "asc" | "desc";
    offset?: number;
    limit?:  number;
};

export async function listPosts(params: ListPostsParams): Promise<PostsList> {
    const resp = await api.get<PostsList>("/posts", {
        params,
        paramsSerializer: {
            serialize(p) {
                const sp = new URLSearchParams();
                for (const [k, v] of Object.entries(p)) {
                    if (v == null) continue;
                    if (Array.isArray(v)) {
                        v.forEach((it) => sp.append(`${k}[]`, String(it)));
                    } else {
                        sp.append(k, String(v));
                    }
                }
                return sp.toString();
            },
        },
    });
    return resp.data;
}