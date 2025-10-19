import {api} from "@features/client.ts";
import type {Category} from "@features/categories/types.ts";

export async function createCategory(input: { title: string; description: string }) {
    const res = await api.post<Category>("/categories", input);
    return res.data;
}
