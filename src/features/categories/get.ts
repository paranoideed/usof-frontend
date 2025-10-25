import api from "@features/api.ts";
import type {Category} from "@features/categories/category.ts";

export default async function getCategory(id: string): Promise<Category> {
    const { data } = await api.get(`/categories/${id}`);
    return data;
}
