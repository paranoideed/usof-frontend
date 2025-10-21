import api from "@features/api.ts";

import type {ListCategories} from "@features/categories/types.ts";

export async function listCategories({limit = 100, offset = 0}): Promise<ListCategories> {
    const { data } = await api.get<ListCategories>("/categories", { params: { limit, offset } });
    return data;
}
