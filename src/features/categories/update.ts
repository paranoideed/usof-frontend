import type {Category} from "@features/categories/types.ts";
import {api} from "@features/client.ts";

export type UpdateCategoryInput = {
    id:          string;
    title:       string | null;
    description: string | null
};

export async function updateCategory(request: UpdateCategoryInput): Promise<Category> {
    const res = await api.patch<Category>(`/categories/${request.id}`, {
        title: request.title,
        description: request.description
    });
    return res.data;
}