import api from "@features/api.ts";
import type {CategoryList} from "@features/categories/category.ts";

export async function listCategories(params?: { limit?: number; offset?: number }): Promise<CategoryList> {
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const { data } = await api.get("/categories", { params: { limit, offset } });
    return data;
}
