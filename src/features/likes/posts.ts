import type {LikeType} from "@features/likes/types.ts";
import {api} from "@features/client.ts";

export async function likePost(postId: string, type: LikeType): Promise<void> {
    const { data } = await api.post(`/posts/${postId}/like`, { type });
    return data;
}

export async function unlikePost(postId: string): Promise<void> {
    const { data } = await api.delete(`/posts/${postId}/like`);
    return data;
}
