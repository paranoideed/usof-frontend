import api from "@features/api.ts";

export async function deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
}