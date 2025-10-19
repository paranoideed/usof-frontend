import {api} from "@features/client.ts";

export async function deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
}
