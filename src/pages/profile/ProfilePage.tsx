import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import s from "./ProfilePage.module.scss";

import { fetchMe, type MeResponse } from "../../features/profile/me";
import { updateMe } from "../../features/profile/me_update";
import { FormError, FormOk } from "../../components/ui/FormAlert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import NavBar from "../../components/ui/NavBar";
import * as React from "react";
import {getCurrentUserId} from "../../features/auth/session.ts";

export default function ProfilePage() {
    const [data, setData] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    // edit state
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState("");
    const [pseudonym, setPseudonym] = useState("");
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    const [fieldErrors, setFieldErrors] = useState<{ username?: string; pseudonym?: string }>({});

    const meId = getCurrentUserId();
    const isMe = data?.id && meId ? data.id === meId : true;

    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        fetchMe()
            .then((me) => {
                if (!alive) return;
                setData(me);
                setUsername(me.username ?? me.username ?? "");
                setPseudonym(me.pseudonym ?? "");
            })
            .catch((err) => {
                if (!alive) return;
                setErrorStatus(err?.response?.status ?? null);
                setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to load profile");
            })
            .finally(() => alive && setLoading(false));

        return () => { alive = false; };
    }, [navigate]);


    function startEdit() {
        if (!data || !isMe) return;

        setFieldErrors({});
        setOk(null);
        setError(null);
        setUsername(((data as any).username ?? (data as any).login ?? "") as string);
        setPseudonym(((data as any).pseudonym ?? "") as string);
        setEditing(true);
    }

    function cancelEdit() {
        setEditing(false);
        setFieldErrors({});
        setOk(null);
    }

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!isMe) return; // защита

        e.preventDefault();
        setOk(null);
        setError(null);
        setFieldErrors({});

        const next: { username?: string; pseudonym?: string } = {};
        if (!username.trim()) next.username = "This is required";
        if (username && username.trim().length < 3) next.username = "Min 3 characters";

        if (Object.keys(next).length) {
            setFieldErrors(next);
            return;
        }

        try {
            setSaving(true);
            const payload = {
                username: username.trim(),
                pseudonym: pseudonym.trim() || null,
            };
            const updated = await updateMe(payload);

            setData((prev) =>
                prev
                    ? { ...prev, username: updated.username, pseudonym: updated.pseudonym as any }
                    : (prev as any)
            );

            setOk("Profile updated");
            setEditing(false);
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                const props = data.properties || {};
                const first = (arr: unknown) =>
                    Array.isArray(arr) && arr.length ? String(arr[0]) : undefined;

                const fe: { username?: string; pseudonym?: string } = {};
                if (props.username?.errors) fe.username = first(props.username.errors);
                if (props.pseudonym?.errors) fe.pseudonym = first(props.pseudonym.errors);

                if (Object.keys(fe).length) setFieldErrors(fe);
                else setError(data.message || data.error || "Validation error");
            } else {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Update failed";
                setError(msg);
            }
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className={s.root}>Loading…</div>;

    return (
        <div className={s.root}>
            <NavBar />
            <div style={{ paddingTop: "15vh" }}>
                <div className={s.card}>
                    <h3 className={s.title}>My Profile</h3>

                    {error && (
                        <>
                            <FormError>{error}</FormError>
                            <div className={s.actions}>
                                {errorStatus === 401 && (
                                    <Button onClick={() => navigate("/login")}>Back to Login</Button>
                                )}
                            </div>
                        </>
                    )}

                    {ok && <FormOk>{ok}</FormOk>}

                    {data && !editing && (
                        <div className={s.container}>
                            <div className={s.profile}>
                                <img
                                    className={s.avatar}
                                    src={
                                        data.avatar ||
                                        "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif"
                                    }
                                    alt="avatar"
                                />
                                <div className={s.info}>
                                    <div className={s.username}>
                                        {(data as any).username ?? (data as any).login}
                                    </div>
                                    {(data as any).pseudonym ? (
                                        <div className={s.pseudonym}>
                                            {(data as any).pseudonym}
                                        </div>
                                    ) : null}
                                    {"reputation" in (data as any) ? (
                                        <div>
                                            <b>Reputation:</b> {(data as any).reputation}
                                        </div>
                                    ) : null}
                                    <div>
                                        <b>Part since:</b>{" "}
                                        {new Date(data.createdAt).toDateString().slice(3)}
                                    </div>
                                </div>
                            </div>

                            <div className={s.actions}>
                                {isMe && <Button onClick={startEdit}>Edit</Button>}
                            </div>
                        </div>
                    )}

                    {data && editing && (
                        <form onSubmit={onSave} noValidate>
                            <div className={s.profile}>
                                <img
                                    className={s.avatar}
                                    src={
                                        data.avatar ||
                                        "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif"
                                    }
                                    alt="avatar"
                                />
                                <div className={s.info}>
                                    <TextField
                                        label="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.currentTarget.value)}
                                        placeholder="mylogin"
                                        error={fieldErrors.username}
                                        required
                                    />
                                    <TextField
                                        label="Pseudonym"
                                        value={pseudonym}
                                        onChange={(e) => setPseudonym(e.currentTarget.value)}
                                        placeholder="optional pseudonym"
                                        error={fieldErrors.pseudonym}
                                    />
                                </div>
                            </div>

                            <div className={s.actions}>
                                <Button type="button" onClick={cancelEdit} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving…" : "Save"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
