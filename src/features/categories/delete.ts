import {api} from "@features/client.ts";

export async function deleteCategory(id: string) {
    await api.delete(`/categories/${id}`);
}
