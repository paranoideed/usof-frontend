import api from "@features/api.ts";

import type {Post} from "@features/posts/post.ts";

export async function getPost(id: string): Promise<Post> {
    const { data } = await api.get<Post>(`/posts/${id}`);

    return data;
}