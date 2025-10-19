import {api} from "@features/client.ts";
import type {Comment} from "@features/comments/types.ts";

export type ListCommentsResponse = {
    data: Comment[];
    total?: number | null;
    limit?: number | null;
    offset?: number | null;
};

// --- API ---
export async function fetchComments(postId: string, limit = 10, offset = 0): Promise<ListCommentsResponse> {
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
): Promise<ListCommentsResponse> {
    const res = await api.get(`/comments`, {
        params: { post_id: postId, parent_id: parentId, limit, offset },
    });
    return res.data;
}