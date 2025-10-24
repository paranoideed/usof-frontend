import * as React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { FormError } from "@/components/ui/FormAlert";

import login from "@/features/auth/login";

import {
    saveAvatar,
    saveUsername,
} from "@/features/auth/sessions";

import s from "./LoginPage.module.scss";

type FieldErrors = {
    identifier?: string;
    password?: string;
};

function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
}

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const next: FieldErrors = {};
        if (!identifier.trim()) next.identifier = "This is required";
        if (!password.trim()) next.password = "This is required";
        if (identifier.trim() && !isEmail(identifier) && identifier.trim().length < 3) {
            next.identifier = "Username must be at least 3 characters";
        }
        if (Object.keys(next).length > 0) {
            setFieldErrors(next);
            return;
        }

        try {
            setLoading(true);
            const data = await login({ identifier, password });

            Cookies.set("token", data.token, {
                expires: 7,
                sameSite: "lax",
                secure: window.location.protocol === "https:",
            });

            saveUsername(data.profile.username);

            if (data.profile.avatar_url) {
                saveAvatar(data.profile.avatar_url);
            }

            navigate("/profiles/me");
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                const props = data.properties || {};
                const first = (arr: unknown) =>
                    Array.isArray(arr) && arr.length ? String(arr[0]) : undefined;

                const fe: FieldErrors = {};
                const uErr = props.username?.errors ? first(props.username.errors) : undefined;
                const eErr = props.email?.errors ? first(props.email.errors) : undefined;
                if (uErr || eErr) fe.identifier = uErr || eErr;
                if (props.password?.errors) fe.password = first(props.password.errors);

                if (Object.keys(fe).length > 0) {
                    setFieldErrors(fe);
                } else {
                    setError(data.message || data.error || "Validation error");
                }
            } else if (status === 401) {
                setError(data?.message || "Invalid credentials");
            } else {
                const msg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Login failed";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={s.root}>
            <div className={s.card}>
                <h3 className={s.title}>Login</h3>

                {error && <FormError>{error}</FormError>}

                <form onSubmit={onSubmit} noValidate>
                    <TextField
                        label="Login or Email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.currentTarget.value)}
                        placeholder="mylogin or user@example.com"
                        error={fieldErrors.identifier}
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

                    <Button type="submit" className={s.button} disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </Button>
                </form>
            </div>

            <div className={s.under_card}>
                <Link to="/register" className={s.link}>
                    Don't have an account? Register!
                </Link>
            </div>
        </div>
    );
}
