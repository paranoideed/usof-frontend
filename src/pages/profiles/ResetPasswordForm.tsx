import * as React from "react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { FormError, FormOk } from "@/components/ui/FormAlert";

import { resetPassword } from "@/features/auth/reset-password";

import s from "./ResetPasswordForm.module.scss";

type FieldErrors = {
    new_password?: string;
    new_password_confirm?: string;
};

type Props = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function ResetPasswordForm({ onSuccess, onCancel }: Props) {
    const [pwd, setPwd] = useState("");
    const [confirm, setConfirm] = useState("");

    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setOk(null);
        setErr(null);
        setFieldErrors({});

        const fe: FieldErrors = {};
        if (!pwd.trim()) fe.new_password = "This is required";
        if (!confirm.trim()) fe.new_password_confirm = "This is required";
        if (!fe.new_password && pwd.length < 6) fe.new_password = "Min 6 characters";
        if (!fe.new_password_confirm && pwd !== confirm) fe.new_password_confirm = "Passwords do not match";

        if (Object.keys(fe).length) { setFieldErrors(fe); return; }

        try {
            setLoading(true);
            await resetPassword({
                password: pwd,
            });
            setOk("Password updated");
            setPwd("");
            setConfirm("");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const status = error?.response?.status;
            const data   = error?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                const props = data.properties || {};
                const first = (v: unknown) => (Array.isArray(v) && v.length ? String(v[0]) : undefined);
                const next: FieldErrors = {};
                if (props.new_password?.errors)        next.new_password = first(props.new_password.errors);
                if (props.new_password_confirm?.errors)next.new_password_confirm = first(props.new_password_confirm.errors);
                if (Object.keys(next).length) setFieldErrors(next);
                else setErr(data.message || data.error || "Validation error");
            } else {
                setErr(
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    "Reset password failed"
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={s.container}>
            <h4 className={s.Title}>Reset password</h4>

            {err && <FormError>{err}</FormError>}
            {ok  && <FormOk>{ok}</FormOk>}

            <form onSubmit={onSubmit} noValidate>
                <TextField
                    label="New password"
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.currentTarget.value)}
                    placeholder="••••••••"
                    error={fieldErrors.new_password}
                    required
                />

                <TextField
                    label="Confirm new password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.currentTarget.value)}
                    placeholder="••••••••"
                    error={fieldErrors.new_password_confirm}
                    required
                />

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Update password"}
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
