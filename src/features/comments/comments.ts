import { api } from "@/features/client";

// --- типы с бэка ---
export type CommentData = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    parent_id:       string | null;
    content:         string;
    likes:           number;
    dislikes:        number;
    created_at:      string; // Date как ISO-строка с бэка
    updated_at:      string | null;
};

export type Comment = {
    data: CommentData;
    user_reaction: string | null;
};

export type ListCommentsResponse = {
    data: Comment[];
    total?: number | null;
    limit?: number | null;
    offset?: number | null;
};

// --- API ---
export async function fetchComments(postId: string, limit = 10, offset = 0) {
    const res = await api.get<ListCommentsResponse>(`/comments`, {
        params: { post_id: postId, limit, offset },
    });
    return res.data;
}

export type CreateCommentInput = {
    post_id:    string;
    author_id:  string;
    parent_id?: string | null;
    content:    string;
}

export async function createComment(payload: CreateCommentInput) {
    const res = await api.post<Comment>(`/comments`, {
        post_id:   payload.post_id,
        content:   payload.content,
        author_id: payload.author_id,
        parent_id: payload.parent_id ?? null,
    });
    return res.data;
}
