import {api} from "@features/client.ts";
import type {Comment} from "@features/comments/types.ts";
import type {LikeType} from "@features/likes/types.ts";

export async function likeComment(commentId: string, type: LikeType):Promise<Comment> {
    const res = await api.post(`/comments/${commentId}/like`, { type });
    return res.data;
}

export async function unlikeComment(commentId: string):Promise<Comment> {
    const res = await api.delete(`/comments/${commentId}/like`);
    return res.data;
}

