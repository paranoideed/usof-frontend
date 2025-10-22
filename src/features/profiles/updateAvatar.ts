import api from "../api.ts";
import type {Profile} from "@features/profiles/types.ts";


export default async function updateAvatar(file: File): Promise<Profile> {
    if (file.type !== "image/png") throw new Error("Only PNG allowed");
    if (file.size > 10 * 1024 * 1024) throw new Error("Max 10MB");

    const form = new FormData();
    form.set("avatar", file);

    try {
        const { data } = await api.post("/profiles/me/avatar", form);
        return data;
    } catch (err: any) {
        if (err.response) {
            console.error("Upload error:", err.response.status, err.response.data);
            throw new Error(err.response.data?.error || `Upload failed: ${err.response.status}`);
        }
        throw err;
    }
}
