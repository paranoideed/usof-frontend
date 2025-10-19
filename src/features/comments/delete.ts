import { api } from "@/features/client";
import type {UserRole} from "@features/auth/sessions.ts";
import type { Comment } from "@/features/comments/types";

export function canDeleteComment(c: Comment, meId: string | null, role: UserRole | null): boolean {
    if (!meId) return false;
    if (role === "admin") return true;
    return c.data.author_id === meId;
}

export async function deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
}
