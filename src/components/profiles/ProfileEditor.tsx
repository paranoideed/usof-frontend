import * as React from "react";

import Button from "../ui/Button.tsx";
import TextField from "../ui/TextField.tsx";

import s from "./ProfileEditor.module.scss";

type Props = {
    avatar?: string | null;
    username: string;
    pseudonym: string;
    fieldErrors: { username?: string; pseudonym?: string };
    saving: boolean;
    onChangeUsername: (v: string) => void;
    onChangePseudonym: (v: string) => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
};

export default function ProfileEditor({
    avatar,
    username,
    pseudonym,
    fieldErrors,
    saving,
    onChangeUsername,
    onChangePseudonym,
    onCancel,
    onSubmit,
}: Props) {
    return (
        <form onSubmit={onSubmit} noValidate>
            <div className={s.profile}>
                <img
                    className={s.avatar}
                    src={avatar || "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif"}
                    alt="avatar"
                />
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
                <Button type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
        </form>
    );
}
