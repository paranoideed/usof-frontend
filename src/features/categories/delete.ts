import api from "@features/api.ts";

export async function deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
}
