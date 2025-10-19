import {api} from "@features/client.ts";
import type {Comment} from "@features/comments/types.ts";

export async function getComment(id: string): Promise<Comment> {
    const res = await api.get(`/comments/${id}`);
    return res.data;
}