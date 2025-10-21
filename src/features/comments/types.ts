export type CommentData = {
    id:              string;
    post_id:         string;
    author_id:       string;
    author_username: string;
    parent_id:       string | null;

    replies_count:   number;

    content:  string;
    likes:    number;
    dislikes: number;

    created_at: Date;
    updated_at: Date | null;
};

export type Comment = {
    data: CommentData;
    user_reaction: string | null;
};

export type CreateCommentInput = {
    post_id:    string;
    author_id:  string;
    parent_id?: string | null;
    content:    string;
}

