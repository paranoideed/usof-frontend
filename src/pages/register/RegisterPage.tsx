import * as React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { FormError, FormOk } from "@/components/ui/FormAlert";

import { register as apiRegister } from "@/features/auth/register";

import s from "./RegisterPage.module.scss";

type FieldErrors = {
    username?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
};

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setOk(null);
        setFieldErrors({});

        const newFieldErrors: FieldErrors = {};

        if (!username.trim()) newFieldErrors.username = "This is required";
        if (!email.trim()) newFieldErrors.email = "This is required";
        if (!password.trim()) newFieldErrors.password = "This is required";
        if (!confirmPassword.trim()) newFieldErrors.passwordConfirm = "This is required";

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors((fe) => ({ ...fe, passwordConfirm: "Passwords do not match" }));
            return;
        }

        try {
            setLoading(true);
            await apiRegister({ username, email, password});
            setOk("Registration successful! You can now log in.");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                const props = data.properties || {};
                const next: FieldErrors = {};

                const first = (arr: unknown) =>
                    Array.isArray(arr) && arr.length ? String(arr[0]) : undefined;

                if (props.login?.errors) next.username = first(props.login.errors);
                if (props.email?.errors) next.email = first(props.email.errors);
                if (props.password?.errors) next.password = first(props.password.errors);
                if (props.passwordConfirm?.errors) next.passwordConfirm = first(props.passwordConfirm.errors);

                if (Object.keys(next).length > 0) {
                    setFieldErrors(next);
                } else {
                    setError(data.message || data.error || "Validation error");
                }
            } else {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Registration failed";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={s.root}>
            <div className={s.card}>
                <h3 className={s.title}>Registration</h3>

                {error && <FormError>{error}</FormError>}
                {ok && <FormOk>{ok}</FormOk>}

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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                        placeholder="••••••••"
                        error={fieldErrors.passwordConfirm}
                        required
                    />

                    <Button type="submit" className={s.button} disabled={loading}>
                        {loading ? "Loading..." : "Register"}
                    </Button>
                </form>
            </div>

            <div className={s.under_card}>
                <Link to="/login" className={s.link}>
                    Already have an account? Login!
                </Link>
            </div>
        </div>
    );
}
