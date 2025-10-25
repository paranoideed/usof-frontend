import api from "@features/api.ts";

import type { CommentList } from "@features/comments/comment";

export async function fetchComments(postId: string, limit = 10, offset = 0): Promise<CommentList> {
    const res = await api.get(`/comments`, {
        params: { post_id: postId, limit, offset },
    });
    return res.data;
}

export async function fetchCommentsByParent(
    postId: string,
    parentId: string | null,
    limit = 10,
    offset = 0
): Promise<CommentList> {
    const res = await api.get(`/comments`, {
        params: { post_id: postId, parent_id: parentId, limit, offset },
    });
    return res.data;
}