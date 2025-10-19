import {api} from "@features/client.ts";

export async function deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
}