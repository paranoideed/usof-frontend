import api from "@features/api.ts";

import type {Post} from "@features/posts/posts.ts";

export async function getPost(id: string): Promise<Post> {
    const { data } = await api.get<Post>(`/posts/${id}`);
    console.log("post categories ", data.categories);
    return data;
}