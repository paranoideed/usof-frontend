import {api} from "@features/client.ts";
import type {Post} from "@features/posts/posts.ts";

export type CreatePostInput = {
    author_id: string;
    title:     string;
    content:   string;
    categories?: string[];
};

export async function createPost(input: CreatePostInput): Promise<Post> {
    const payload = {
        author_id:  input.author_id,
        title:      input.title?.trim(),
        content:    input.content?.trim(),
        categories: input.categories && input.categories.length ? input.categories : undefined,
    };
    const { data } = await api.post<Post>("/posts", payload);
    return data;
}