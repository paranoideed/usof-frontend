import api from "../api.ts";
import type {Profile} from "@features/profiles/profile.ts";
import {saveAvatar} from "@features/auth/sessions.ts";

export default async function updateAvatar(file: File): Promise<Profile> {
    const form = new FormData();
    form.set("avatar", file);

    try {
        const { data } = await api.post("/profiles/me/avatar", form);
        saveAvatar(data.data.attributes.avatar_url);

        return data;
    } catch (err: any) {
        if (err.response) {
            console.error("Upload error:", err.response.status, err.response.data);
            throw new Error(err.response.data?.error || `Upload failed: ${err.response.status}`);
        }
        throw err;
    }
}
