import {api} from "@features/client.ts";
import type {Post, PostStatus} from "@features/posts/posts.ts";

export type PostUpdateInput = {
    id: string;
    title: string;
    content: string;
    categories: string[];
};

export async function updatePost(body: PostUpdateInput): Promise<Post> {
    const { id, ...rest } = body;

    const payload = {
        title: rest.title?.trim(),
        content: rest.content?.trim(),
        categories: Array.isArray(rest.categories) ? rest.categories.slice(0, 5) : [],
    };

    const res = await api.put<Post>(`/posts/${id}`, payload);
    return res.data;
}

export async function updatePostStatus(postId: string, status: PostStatus): Promise<void> {
    await api.patch(`/posts/${postId}/status`, { status });
}
