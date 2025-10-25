import * as React from "react";
import Button from "../ui/Button.tsx";
import TextField from "../ui/TextField.tsx";
import s from "./ProfileEditor.module.scss";
import updateAvatar from "@features/profiles/updateAvatar.ts";

import getUserPic from "@features/ui.ts";
import AvatarImg from "@components/ui/AvatarImg.tsx"; // <-- добавили

type Props = {
    username: string;
    pseudonym: string;
    avatarUrl?: string | null;
    fieldErrors: { username?: string; pseudonym?: string };
    saving: boolean;
    onChangeUsername: (v: string) => void;
    onChangePseudonym: (v: string) => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function ProfileEditor(props: Props) {
    const {
        username,
        pseudonym,
        avatarUrl,
        fieldErrors,
        saving,
        onChangeUsername,
        onChangePseudonym,
        onCancel,
        onSubmit,
    } = props;

    const [uploading, setUploading] = React.useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);
    let   avatar = getUserPic(avatarUrl);

    async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const profile = await updateAvatar(file);
            if (profile.data.attributes.avatar_url) {
                avatar = profile.data.attributes.avatar_url;
            }
        } catch (err: any) {
            console.error(err);

            alert(err.message || "Failed to upload avatar");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    return (
        <form onSubmit={onSubmit} noValidate>
            <div className={s.profile}>
                <div className={s.avatarWrapper}>
                    <AvatarImg
                        className={s.avatar}
                        src={avatar}
                        alt="avatar"
                        onClick={() => fileRef.current?.click()}
                    />
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png"
                        hidden
                        onChange={onAvatarChange}
                    />
                    <Button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading…" : "Change Avatar"}
                    </Button>
                </div>

                <div className={s.info}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => onChangeUsername(e.currentTarget.value)}
                        placeholder="mylogin"
                        error={fieldErrors.username}
                        required
                    />
                    <TextField
                        label="Pseudonym"
                        value={pseudonym}
                        onChange={(e) => onChangePseudonym(e.currentTarget.value)}
                        placeholder="optional pseudonym"
                        error={fieldErrors.pseudonym}
                    />
                </div>
            </div>

            <div className={s.actions}>
                <Button type="button" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </div>
        </form>
    );
}
