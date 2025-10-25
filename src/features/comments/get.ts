import api from "@features/api.ts";

import type { Comment } from "@features/comments/comment";

export async function getComment(id: string): Promise<Comment> {
    const res = await api.get(`/comments/${id}`);
    return res.data;
}