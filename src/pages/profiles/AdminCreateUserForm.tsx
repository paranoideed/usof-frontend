import * as React from "react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { FormError, FormOk } from "@/components/ui/FormAlert";

import { registerByAdmin } from "@/features/auth/register";

type FieldErrors = {
    username?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    role?: string;
};

type Props = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function AdminCreateUserForm({ onSuccess, onCancel }: Props) {
    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm]   = useState("");
    const [role, setRole]         = useState<"user" | "admin">("user");

    const [loading, setLoading] = useState(false);
    const [ok, setOk]           = useState<string | null>(null);
    const [err, setErr]         = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setOk(null);
        setErr(null);
        setFieldErrors({});

        const fe: FieldErrors = {};
        if (!username.trim())      fe.username = "This is required";
        if (!email.trim())         fe.email = "This is required";
        if (!password.trim())      fe.password = "This is required";
        if (!confirm.trim())       fe.passwordConfirm = "This is required";
        if (password !== confirm)  fe.passwordConfirm = "Passwords do not match";
        if (!role)                 fe.role = "This is required";

        if (Object.keys(fe).length) { setFieldErrors(fe); return; }

        try {
            setLoading(true);
            await registerByAdmin({ username: username.trim(), email: email.trim(), password, role });
            setOk("User created");
            setUsername(""); setEmail(""); setPassword(""); setConfirm(""); setRole("user");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const status = error?.response?.status;
            const data   = error?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                const props = data.properties || {};
                const first = (v: unknown) => (Array.isArray(v) && v.length ? String(v[0]) : undefined);
                const next: FieldErrors = {};
                if (props.username?.errors)       next.username = first(props.username.errors);
                if (props.email?.errors)          next.email = first(props.email.errors);
                if (props.password?.errors)       next.password = first(props.password.errors);
                if (props.passwordConfirm?.errors)next.passwordConfirm = first(props.passwordConfirm.errors);
                if (props.role?.errors)           next.role = first(props.role.errors);
                if (Object.keys(next).length) setFieldErrors(next);
                else setErr(data.message || data.error || "Validation error");
            } else {
                setErr(
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "Create user failed"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Create user (admin)</h4>

            {err && <FormError>{err}</FormError>}
            {ok  && <FormOk>{ok}</FormOk>}

            <form onSubmit={onSubmit} noValidate>
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    placeholder="username"
                    error={fieldErrors.username}
                    required
                />

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    placeholder="user@example.com"
                    error={fieldErrors.email}
                    required
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder="••••••••"
                    error={fieldErrors.password}
                    required
                />

                <TextField
                    label="Confirm password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.currentTarget.value)}
                    placeholder="••••••••"
                    error={fieldErrors.passwordConfirm}
                    required
                />

                {/* Простой селект без внешних зависимостей */}
                <div style={{ margin: "12px 0" }}>
                    <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.currentTarget.value as "user" | "admin")}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #444" }}
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                    {fieldErrors.role && (
                        <div style={{ color: "#ff6b6b", fontSize: 12, marginTop: 6 }}>{fieldErrors.role}</div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Create"}
                    </Button>
                    {onCancel && (
                        <Button type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
