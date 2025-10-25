import api from"@features/api.ts";

import type {UserRole} from "@features/auth/sessions.ts";
import type { Comment } from "@features/comments/comment";

// export type deleteCommentInput = {
//     data: {
//         type: "comment"
//         id: string;
//     }
// }

export async function deleteComment(commentId: string): Promise<void> {
    // const body: deleteCommentInput  = {
    //     data: {
    //         type: "comment",
    //         id: commentId,
    //     }
    // }

    await api.delete(`/comments/${commentId}`);
}

export function canDeleteComment(c: Comment, meId: string | null, role: UserRole | null): boolean {
    if (!meId) return false;
    if (role === "admin") return true;
    return c.data.attributes.author_id === meId;
}