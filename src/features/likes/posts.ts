import api from "@features/api.ts";

import type {LikeType} from "@features/likes/like.ts";

export type PostLikeInput = {
    data: {
        id:   string
        type: string;
        attributes: {
            type: LikeType;
        }
    }
}

export async function likePost(postId: string, type: LikeType): Promise<void> {
    const body: PostLikeInput = {
        data: {
            id: postId,
            type: "post",
            attributes: {
                type,
            },
        },
    };

    const { data } = await api.post(`/posts/${postId}/like`, body);
    return data;
}

export type UnlikePostInput = {
    data: {
        id:   string
        type: string;
    }
}

export async function unlikePost(postId: string): Promise<void> {
    const body: UnlikePostInput = {
        data: {
            id: postId,
            type: "post",
        },
    };

    const { data } = await api.delete(`/posts/${postId}/like`, body);
    return data;
}
