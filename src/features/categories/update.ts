import api from "@features/api.ts";

import type {Category} from "@features/categories/category";

export type UpdateCategoryInput = {
    data: {
        type: "category"
        id: string;
        attributes: {
            title:        string | null;
            description: string | null;
        }
    }
};

export async function updateCategory(params: {categoryId: string, title?: string | null, description?: string | null}): Promise<Category> {
    const body: UpdateCategoryInput  = {
        data: {
            type: "category",
            id: params.categoryId,
            attributes: {
                title:       params.title ?? null,
                description: params.description ?? null,
            }
        }
    };

    const res = await api.patch(`/categories/${params.categoryId}`, body);
    return res.data;
}