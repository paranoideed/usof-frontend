export type Comment = {
    data: {
        id: string;
        type: "comment"
        attributes: {
            post_id:         string;
            author_id:       string;
            author_username: string;
            parent_id:       string | null;
            user_reaction: string | null;

            replies_count:   number;

            content:  string;
            likes:    number;
            dislikes: number;

            created_at: Date;
            updated_at: Date | null;
        }
    }
}

export type CommentList = {
    data: {
        id: string;
        type: "comment"
        attributes: {
            post_id:         string;
            author_id:       string;
            author_username: string;
            parent_id:       string | null;
            user_reaction: string | null;

            replies_count:   number;

            content:  string;
            likes:    number;
            dislikes: number;

            created_at: Date;
            updated_at: Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}
