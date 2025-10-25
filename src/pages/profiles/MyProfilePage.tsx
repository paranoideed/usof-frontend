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
import getUserPic from "@features/ui.ts";

export default function MyProfilePage() {
    const { data, loading, error, status, setData, reload } = useMeProfile();

    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [pseudonym, setPseudonym] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; pseudonym?: string }>({});
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const navigate = useNavigate();

    const startEdit = () => {
        if (!data) return;
        setFieldErrors({});
        setOk(null);
        const attrs = (data as any)?.data?.attributes ?? (data as any);
        setUsername(String(attrs.username ?? attrs.login ?? ""));
        setPseudonym(String(attrs.pseudonym ?? ""));
        setEditing(true);
    };

    const cancelEdit = () => { setEditing(false); setFieldErrors({}); setOk(null); };

    const userLogout = () => { logout().finally(() => navigate("/login", { replace: true })); };

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const next: { username?: string; pseudonym?: string } = {};
        if (!username.trim()) next.username = "This is required";
        if (username && username.trim().length < 3) next.username = "Min 3 characters";
        if (Object.keys(next).length) { setFieldErrors(next); return; }

        try {
            setSaving(true);
            const updated = await updateMe({
                username: username.trim(),
                pseudonym: pseudonym.trim() || null,
            });

            const attrs = updated.data.attributes;
            setData(prev =>
                prev
                    ? {
                        ...prev,
                        data: {
                            ...(prev as any).data,
                            attributes: {
                                ...(prev as any).data?.attributes,
                                username: attrs.username,
                                pseudonym: attrs.pseudonym ?? null,
                            },
                        },
                    }
                    : prev
            );

            setOk("Profile updated");
            setEditing(false);

            void reload();
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

    const onAvatarUpdated = (newUrl: string) => {
        setData(prev =>
            prev
                ? {
                    ...prev,
                    data: {
                        ...(prev as any).data,
                        attributes: {
                            ...(prev as any).data?.attributes,
                            avatar_url: newUrl,
                        },
                    },
                }
                : prev
        );
        void reload();
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
                            {status === 401 && <Button onClick={() => navigate("/login")}>Back to Login</Button>}
                        </div>
                    </>
                )}

                {ok && <FormOk>{ok}</FormOk>}

                {data && !editing && !loading && (
                    <ProfileView
                        profile={data}
                        actions={
                            <>
                                <Button onClick={startEdit}>Edit</Button>
                                <Button onClick={userLogout}>Logout</Button>
                                {(data as any).role === "admin" && (
                                    <Button onClick={() => setCreateOpen(v => !v)}>
                                        {createOpen ? "Close create form" : "Create user"}
                                    </Button>
                                )}
                            </>
                        }
                    />
                )}

                {data && editing && !loading && (
                    <ProfileEditor
                        avatarUrl={getUserPic(data.data.attributes.avatar_url)} // <-- кэш-бастер
                        username={username}
                        pseudonym={pseudonym}
                        fieldErrors={fieldErrors}
                        saving={saving}
                        onChangeUsername={setUsername}
                        onChangePseudonym={setPseudonym}
                        onCancel={cancelEdit}
                        onSubmit={onSave}
                        onAvatarUpdated={onAvatarUpdated} // <-- новый проп
                    />
                )}
            </div>

            {data && (
                <section className={s.section}>
                    <ResetPasswordForm onCancel={() => {}} />
                </section>
            )}

            {data && (data as any).role === "admin" && createOpen && (
                <section className={s.section}>
                    <AdminCreateUserForm onSuccess={() => {}} onCancel={() => setCreateOpen(false)} />
                </section>
            )}
        </div>
    );
}
