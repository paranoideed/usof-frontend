import api from "@features/api.ts";

import type {Comment, CreateCommentInput} from "@features/comments/types.ts";

export async function createComment(payload: CreateCommentInput): Promise<Comment> {
    const res = await api.post(`/comments`, {
        post_id:   payload.post_id,
        content:   payload.content,
        author_id: payload.author_id,
        parent_id: payload.parent_id ?? null,
    });
    return res.data;
}
