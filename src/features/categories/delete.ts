import api from "@features/api.ts";

export type DeleteCategoryInput = {
    data: {
        type: "category"
        id: string;
    }
}

export async function deleteCategory(id: string): Promise<void> {
    const body: DeleteCategoryInput  = {
        data: {
            type: "category",
            id: id,
        }
    }

    await api.delete(`/categories/${id}`, body);
}
