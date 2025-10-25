import type {CategoryData} from "@features/categories/create.ts";

export type Post = {
    data: {
        id: string;
        type: "post"
        attributes: {
            author_id:          string;
            author_username:    string;
            author_avatar_url:  string | null;

            title:              string;
            status:             string;
            content:            string;

            likes:              number;
            dislikes:           number;

            categories:         CategoryData[];
            user_reaction:      string | null;

            created_at:         Date;
            updated_at:         Date | null;
        }
    }
}

export type PostsList = {
    data: {
        id: string;
        type: "post"
        attributes: {
            author_id:          string;
            author_username:    string;
            author_avatar_url:  string | null;

            title:              string;
            status:             string;
            content:            string;

            likes:              number;
            dislikes:           number;

            categories:         CategoryData[];
            user_reaction:      string | null;

            created_at:         Date;
            updated_at:         Date | null;
        }
    }[];
    pagination: {
        offset: number;
        limit:  number;
        total:  number;
    };
}

export type PostStatus = "active" | "closed";