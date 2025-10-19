import type {Category} from "@features/categories/types.ts";

export type PostStatus = "active" | "closed";

export type PostData = {
    id:              string;
    author_id:       string;
    author_username: string;
    title:           string;
    status:          string;
    content:         string;
    likes:           number;
    dislikes:        number;
    created_at:      string;
    updated_at:      string | null;
};

export type Post = {
    data:          PostData;
    categories:    Category[];
    user_reaction: string | null;
    can_delete?:    boolean; // <—
}

export type PostsList = {
    posts: Post[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
    };
};
