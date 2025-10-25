import api from "@features/api.ts";
import type {Post} from "@features/posts/post.ts";


export type CreatePostInput = {
    data: {
        type: "post";
        attributes: {
            title:      string;
            content:    string;
            categories?: string[];
        };
    }
};

export async function createPost(input: {
    title: string;
    content: string;
    categories?: string[];
}): Promise<Post> {
    const body: CreatePostInput = {
        data: {
            type: "post",
            attributes: {
                title:      input.title,
                content:    input.content,
                categories: input.categories,
            },
        },
    };

    const { data } = await api.post<Post>("/posts", body);
    return data;
}