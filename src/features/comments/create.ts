import api from "@features/api.ts";

import type { Comment } from "@features/comments/comment";

export type CommentCreate = {
    data: {
        type: "comment"
        attributes: {
            post_id:    string;
            content:    string;
            parent_id:  string | null;
            created_at: Date;
        }
    }
}

export async function createComment(input: {
    post_id: string,
    content: string,
    author_id: string,
    parent_id?: string,
}): Promise<Comment> {
    const body: CommentCreate  = {
        data: {
            type: "comment",
            attributes: {
                post_id:    input.post_id,
                content:    input.content,
                parent_id:  input.parent_id ?? null,
                created_at: new Date(),
            }
        }
    }

    const res = await api.post(`/comments`, body);
    return res.data;
}
