import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import Button from "@/components/ui/Button";
import ProfileView from "@/components/profiles/ProfileView";
import ProfileEditor from "@/components/profiles/ProfileEditor";
import { FormError, FormOk } from "@/components/ui/FormAlert";

import useMeProfile from "./hooks/useMeProfile.ts";

import logout from "@/features/auth/logout";
import updateMe from "@features/profiles/update.ts";

import AdminCreateUserForm from "@pages/profiles/AdminCreateUserForm.tsx";
import ResetPasswordForm from "@pages/profiles/ResetPasswordForm.tsx";

import s from "./MyProfilePage.module.scss";
import type { Profile } from "@features/profiles/types.ts";

export default function MyProfilePage() {
    const { data, loading, error, status, setData } = useMeProfile();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [pseudonym, setPseudonym] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; pseudonym?: string }>({});
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);

    // создание нового юзера по-прежнему по кнопке (для админа)
    const [createOpen, setCreateOpen] = useState(false);

    const navigate = useNavigate();

    const startEdit = () => {
        if (!data) return;
        setFieldErrors({});
        setOk(null);
        setUsername(((data as any).username ?? (data as any).login ?? "") as string);
        setPseudonym(((data as any).pseudonym ?? "") as string);
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setFieldErrors({});
        setOk(null);
    };

    const userLogout = () => {
        logout().finally(() => navigate("/login", { replace: true }));
    };

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const next: { username?: string; pseudonym?: string } = {};
        if (!username.trim()) next.username = "This is required";
        if (username && username.trim().length < 3) next.username = "Min 3 characters";
        if (Object.keys(next).length) {
            setFieldErrors(next);
            return;
        }

        try {
            setSaving(true);
            const trimmedUsername = username.trim();

            const updated = await updateMe({
                username: trimmedUsername,
                pseudonym: pseudonym.trim() || null,
            });

            setData((prev: Profile | null) =>
                prev
                    ? {
                        ...prev,
                        username: updated.username,
                        pseudonym: (updated as any).pseudonym,
                    }
                    : prev
            );
            setOk("Profile updated");
            setEditing(false);
        } catch (err: any) {
            const status = err?.response?.status;
            const d = err?.response?.data;
            if (status === 400 && d && typeof d === "object") {
                const props = d.properties || {};
                const first = (arr: unknown) => (Array.isArray(arr) && arr.length ? String(arr[0]) : undefined);
                const fe: { username?: string; pseudonym?: string } = {};
                if (props.username?.errors) fe.username = first(props.username.errors);
                if (props.pseudonym?.errors) fe.pseudonym = first(props.pseudonym.errors);
                if (Object.keys(fe).length) setFieldErrors(fe);
            } else {
                alert(d?.message || d?.error || err?.message || "Update failed");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={s.root}>
            <NavBar />
            <div className={s.card}>
                {loading && <div>Loading…</div>}

                {error && (
                    <>
                        <FormError>{error}</FormError>
                        <div className={s.actions}>
                            {status === 401 && (
                                <Button onClick={() => navigate("/login")}>
                                    Back to Login
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {ok && <FormOk>{ok}</FormOk>}

                {data && !editing && !loading && (
                    <>
                        <ProfileView
                            avatar_url={data.avatar_url}
                            username={(data as any).username ?? (data as any).login}
                            pseudonym={(data as any).pseudonym}
                            reputation={"reputation" in (data as any) ? (data as any).reputation : null}
                            created_at={data.created_at}
                            actions={
                                <>
                                    <Button onClick={startEdit}>Edit</Button>
                                    <Button onClick={userLogout}>Logout</Button>
                                    {(data as any).role === "admin" && (
                                        <Button onClick={() => setCreateOpen((v) => !v)}>
                                            {createOpen ? "Close create form" : "Create user"}
                                        </Button>
                                    )}
                                </>
                            }
                        />
                    </>
                )}

                {data && editing && !loading && (
                    <ProfileEditor
                        avatarUrl={data.avatar_url}
                        username={username}
                        pseudonym={pseudonym}
                        fieldErrors={fieldErrors}
                        saving={saving}
                        onChangeUsername={setUsername}
                        onChangePseudonym={setPseudonym}
                        onCancel={cancelEdit}
                        onSubmit={onSave}
                    />
                )}
            </div>

            {data && (
                <section className={s.section}>
                    <ResetPasswordForm onCancel={() => { /* оставим пустым, если в форме есть cancel — можно скрыть поля локально */ }} />
                </section>
            )}

            {data && (data as any).role === "admin" && createOpen && (
                <section className={s.section}>
                    <AdminCreateUserForm
                        onSuccess={() => {}}
                        onCancel={() => setCreateOpen(false)}
                    />
                </section>
            )}
        </div>
    );
}
