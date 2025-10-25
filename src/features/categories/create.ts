import api from "@features/api.ts";
import type {Category} from "@features/categories/category.ts";

export type CreateCategoryInput = {
    data: {
        type: "category"
        attributes: {
            title:        string;
            description: string | null;
        }
    }
}

export async function createCategory(input: { title: string; description: string }): Promise<Category> {
    const body: CreateCategoryInput  = {
        data: {
            type: "category",
            attributes: {
                title:       input.title,
                description: input.description,
            }
        }
    }

    const res = await api.post<Category>("/categories", body);
    return res.data;
}
