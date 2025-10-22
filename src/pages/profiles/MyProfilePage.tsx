import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import Button from "@/components/ui/Button";
import ProfileView from "@/components/profiles/ProfileView";
import ProfileEditor from "@/components/profiles/ProfileEditor";
import { FormError, FormOk } from "@/components/ui/FormAlert";

import useProfile from "./hooks/useProfile.ts";

import logout from "@/features/auth/logout";
import updateMe from "@features/profiles/update.ts";

import type {MeResponse} from "@features/profiles/get.ts";

import s from "./MyProfilePage.module.scss";
import AdminCreateUserForm from "@pages/profiles/AdminCreateUserForm.tsx";
import ResetPasswordForm from "@pages/profiles/ResetPasswordForm.tsx";

export default function MyProfilePage() {
    const { data, loading, error, status, setData } = useProfile();
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [pseudonym, setPseudonym] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; pseudonym?: string }>({});
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);

    const navigate = useNavigate();

    if (loading) return <div className={s.root}>Loading…</div>;

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
        if (Object.keys(next).length) { setFieldErrors(next); return; }

        try {
            setSaving(true);
            const updated = await updateMe({ username: username.trim(), pseudonym: pseudonym.trim() || null });

            setData((prev: MeResponse | null) =>
                prev
                    ? { ...prev, username: updated.username, pseudonym: (updated as any).pseudonym }
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
                <h3 className={s.title}>My Profile</h3>

                {error && (
                    <>
                        <FormError>{error}</FormError>
                        <div className={s.actions}>
                            {status === 401 && <Button onClick={() => navigate("/login")}>Back to Login</Button>}
                        </div>
                    </>
                )}

                {ok && <FormOk>{ok}</FormOk>}

                {data && !editing && (
                    <>
                        <ProfileView
                            user_id={data.id}
                            username={(data as any).username ?? (data as any).login}
                            pseudonym={(data as any).pseudonym}
                            reputation={"reputation" in (data as any) ? (data as any).reputation : null}
                            created_at={data.created_at}
                            actions={
                                <>
                                    <Button onClick={startEdit}>Edit</Button>
                                    <Button onClick={userLogout}>Logout</Button>
                                    <Button onClick={() => setResetOpen(v => !v)}>
                                        {resetOpen ? "Close reset" : "Reset password"}
                                    </Button>
                                    {((data as any).role === "admin") && (
                                        <Button onClick={() => setCreateOpen((v) => !v)}>
                                            {createOpen ? "Close create form" : "Create user"}
                                        </Button>
                                    )}
                                </>
                            }
                        />

                        {((data as any).role === "admin") && createOpen && (
                            <AdminCreateUserForm onSuccess={() => { /* можно обновить список/метрику */ }} onCancel={() => setCreateOpen(false)} />
                        )}
                        {resetOpen && <ResetPasswordForm onCancel={() => setResetOpen(false)} />}
                    </>
                )}

                {data && editing && (
                    <ProfileEditor
                        userId={data.id}
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
        </div>
    );
}
