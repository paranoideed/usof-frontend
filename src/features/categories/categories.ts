// src/api/categories.ts
import { api } from "../client";

export type CategoryRow = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string | null;
};

export type ListCategoriesRequest = {
    offset?: number;
    limit?: number;
};

export type ListCategoriesResponse = {
    data: CategoryRow[];
    limit: number | null;
    offset: number | null;
    total: number | null;
};

export async function listCategories(request: ListCategoriesRequest): Promise<ListCategoriesResponse>  {
    try {
        const { data } = await api.get("/categories", { params: request });
        return data;
    } catch (error: any) {
        if (error.response) throw error;
        throw new Error(error.message || "Network error");
    }
}

export async function createCategory(input: { title: string; description: string }) {
    const res = await api.post<CategoryRow>("/categories", input);
    return res.data;
}

export type UpdateCategoryInput = {
    id: string;
    title: string | null;
    description: string | null
};

export async function updateCategory(request: UpdateCategoryInput): Promise<CategoryRow> {
    const res = await api.patch<CategoryRow>(`/categories/${request.id}`, {
        title: request.title,
        description: request.description
    });
    return res.data;
}

export async function deleteCategory(id: string) {
    await api.delete(`/categories/${id}`);
}
