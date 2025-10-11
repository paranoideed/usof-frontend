import { api } from "@/features/client";

export type PostStatus = "active" | "inactive" | "hidden";

export type PostData = {
    id:              string;
    author_id:       string;
    author_username: string;
    title:           string;
    status:          string;
    content:         string;
    likes:           number;
    dislikes:        number;
    created_at:      Date;
    updated_at:      Date | null;
}

export type PostsList = {
    posts: Post[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
    };
};

export type Post = {
    data:          PostData;
    categories:    Category[];
    user_reaction: string | null;
}

// Category type
export type Category = {
    id:          string;
    title:       string;
    description: string;
    created_at:  Date;
    updated_at:  Date | null;
};

export type ListPostsParams = {
    author_id?:       string;
    author_username?: string;
    status?:          PostStatus;
    title?:           string;

    category_ids?:    string[];
    categories_mode?: "any" | "all";

    order_by?:  "created_at" | "updated_at" | "likes" | "dislikes" | "rating";
    order_dir?: "asc" | "desc";

    offset?: number;
    limit?:  number;
};

function toCSV(a?: string[]) {
    return a && a.length ? a.join(",") : undefined;
}

export async function listPosts(params: ListPostsParams): Promise<PostsList> {
    const resp = await api.get<PostsList>("/posts", {
        params: {
            ...params,
            category_ids: toCSV(params.category_ids),
        },
    });
    return resp.data;
}

export type CreatePostInput = {
    author_id:   string;
    title:       string;
    content:     string;
    categories?: string[];
};

export async function createPost(input: CreatePostInput): Promise<Post> {
    const payload = {
        author_id:  input.author_id,
        title:      input.title?.trim(),
        content:    input.content?.trim(),
        categories: input.categories && input.categories.length ? input.categories : undefined,
    };
    const { data } = await api.post<Post>("/posts", payload);
    return data;
}

export type CategoryRow = {
    id:          string;
    title:       string;
    description: string;
    created_at:  string;
    updated_at:  string | null;
};
export type ListCategoriesResponse = {
    data:   CategoryRow[];
    limit:  number | null;
    offset: number | null;
    total:  number | null;
};

export async function listCategories(limit = 100, offset = 0): Promise<CategoryRow[]> {
    const { data } = await api.get<ListCategoriesResponse>("/categories", { params: { limit, offset } });
    return data.data;
}

export type LikeType = "like" | "dislike";
export type MyReaction = LikeType | null;

export function parseMyReaction(s?: string | null): MyReaction {
    return s === "like" || s === "dislike" ? s : null;
}


export async function likePost(postId: string, type: LikeType) {
    const { data } = await api.post(`/posts/${postId}/like`, { type });
    return data;
}

export async function unlikePost(postId: string) {
    const { data } = await api.delete(`/posts/${postId}/like`);
    return data;
}