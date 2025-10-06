import { useState } from "react";
import { useNavigate } from "react-router-dom";

import s from "./RegisterPage.module.scss";
import { register as apiRegister } from "../../api/auth";
import * as React from "react";

type FieldErrors = {
    login?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
};

export default function RegisterPage() {
    const [login, setLogin] = useState("");
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

        if (!login.trim()) newFieldErrors.login = "This is required";
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
            await apiRegister({ login, email, password, passwordConfirm: confirmPassword });
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

                const first = (arr: unknown) => (Array.isArray(arr) && arr.length ? String(arr[0]) : undefined);

                if (props.login?.errors) next.login = first(props.login.errors);
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

                {error && <div className={s.formError}>{error}</div>}
                {ok && <div className={s.formOk}>{ok}</div>}

                <form onSubmit={onSubmit} noValidate>
                    <div className={s.formGroup}>
                        <label className={s.label}>Login</label>
                        <input
                            type="text"
                            className={`${s.input} ${fieldErrors.login ? s.inputInvalid : ""}`}
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="mylogin"
                            required
                            aria-invalid={!!fieldErrors.login}
                        />
                        {fieldErrors.login && <div className={s.fieldError}>{fieldErrors.login}</div>}
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.label}>Email</label>
                        <input
                            type="email"
                            className={`${s.input} ${fieldErrors.email ? s.inputInvalid : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            aria-invalid={!!fieldErrors.email}
                        />
                        {fieldErrors.email && <div className={s.fieldError}>{fieldErrors.email}</div>}
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.label}>Password</label>
                        <input
                            type="password"
                            className={`${s.input} ${fieldErrors.password ? s.inputInvalid : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            aria-invalid={!!fieldErrors.password}
                        />
                        {fieldErrors.password && <div className={s.fieldError}>{fieldErrors.password}</div>}
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.label}>Confirm password</label>
                        <input
                            type="password"
                            className={`${s.input} ${fieldErrors.passwordConfirm ? s.inputInvalid : ""}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            aria-invalid={!!fieldErrors.passwordConfirm}
                        />
                        {fieldErrors.passwordConfirm && (
                            <div className={s.fieldError}>{fieldErrors.passwordConfirm}</div>
                        )}
                    </div>

                    <button type="submit" className={s.button} disabled={loading}>
                        {loading ? "Loading..." : "Register"}
                    </button>
                </form>
            </div>

            <div className={s.under_card}>
                <a href="/login" className={s.link}>
                    Already have an account? Login!
                </a>
            </div>
        </div>
    );
}
