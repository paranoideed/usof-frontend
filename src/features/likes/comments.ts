import api from "@features/api.ts";

import type {Comment} from "@features/comments/create.ts";
import type {LikeType} from "@features/likes/like.ts";

export type CommentLikeInput = {
    data: {
        id:   string
        type: string;
        attributes: {
            type: LikeType;
        }
    }
}

export async function likeComment(commentId: string, type: LikeType):Promise<Comment> {
    const body: CommentLikeInput = {
        data: {
            id: commentId,
            type: "comment",
            attributes: {
                type,
            },
        },
    };

    const res = await api.post(`/comments/${commentId}/like`, body);
    return res.data;
}

export type UnlikeCommentInput = {
    data: {
        id:   string
        type: string;
    }
}

export async function unlikeComment(commentId: string):Promise<Comment> {
    const body: UnlikeCommentInput = {
        data: {
            id: commentId,
            type: "comment",
        },
    };

    const res = await api.delete(`/comments/${commentId}/like`, body);
    return res.data;
}

