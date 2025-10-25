import api from "@features/api.ts";
import type {Post, PostStatus} from "@features/posts/post.ts";

export type PostUpdateInput = {
    data: {
        type: "post";
        id:   string;
        attributes: {
            title?:      string;
            content?:    string;
            categories?: string[];
        };
    };
};

export async function updatePost(input: {
    id: string;
    title?: string;
    content?: string;
    categories?: string[];
}): Promise<Post> {
    const payload = {
        data: {
            type: "post",
            id:   input.id,
            attributes: {
                title:      input.title,
                content:    input.content,
                categories: input.categories,
            },
        },
    };

    const res = await api.put<Post>(`/posts/${input.id}`, payload);
    return res.data;
}

export type PostStatusUpdateInput = {
    data: {
        type: "post";
        id:   string;
        attributes: {
            status: PostStatus;
        };
    };
};

export async function updatePostStatus(input: {
    postId: string;
    status: PostStatus;
}): Promise<Post> {
    const payload = {
        data: {
            type: "post",
            id:   input.postId,
            attributes: {
                status: input.status,
            },
        },
    };

    const res = await api.patch<Post>(`/posts/${input.postId}/status`, payload);
    return res.data;
}
