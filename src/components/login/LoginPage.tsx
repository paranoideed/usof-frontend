import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import s from "./LoginPage.module.scss";
import { login as apiLogin } from "../../api/auth.ts";

type FieldErrors = {
    identifier?: string;
    password?: string;
};

function isEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
}

export default function LoginPage() {
    const [identifier, setIdentifier] = useState(""); // login OR email
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // верхняя общая ошибка
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // --- простая клиентская валидация ---
        const next: FieldErrors = {};
        if (!identifier.trim()) next.identifier = "This is required";
        if (!password.trim()) next.password = "This is required";

        // если не email → это username: проверим min длину (3)
        if (identifier.trim() && !isEmail(identifier) && identifier.trim().length < 3) {
            next.identifier = "Username must be at least 3 characters";
        }

        if (Object.keys(next).length > 0) {
            setFieldErrors(next);
            return;
        }

        try {
            setLoading(true);
            const data = await apiLogin({ identifier, password }); // { token }

            // сохранить токен в cookie
            Cookies.set("token", data.token, {
                expires: 7,
                sameSite: "lax",
                secure: window.location.protocol === "https:",
            });

            // (опционально) проставить Authorization для axios
            // import { api } from "../../api/client";
            // api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

            // редирект после успеха
            navigate("/");
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;

            if (status === 400 && data && typeof data === "object") {
                // распарсим properties.{username|email|password}.errors
                const props = data.properties || {};
                const first = (arr: unknown) => (Array.isArray(arr) && arr.length ? String(arr[0]) : undefined);

                const fe: FieldErrors = {};
                // если бэк положил ошибку в username или email — показываем в едином поле identifier
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
                // частый кейс — неверные учётные данные
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

                {error && <div className={s.formError}>{error}</div>}

                <form onSubmit={onSubmit} noValidate>
                    <div className={s.formGroup}>
                        <label className={s.label}>Login or Email</label>
                        <input
                            type="text"
                            className={`${s.input} ${fieldErrors.identifier ? s.inputInvalid : ""}`}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="mylogin or user@example.com"
                            aria-invalid={!!fieldErrors.identifier}
                        />
                        {fieldErrors.identifier && <div className={s.fieldError}>{fieldErrors.identifier}</div>}
                    </div>

                    <div className={s.formGroup}>
                        <label className={s.label}>Password</label>
                        <input
                            type="password"
                            className={`${s.input} ${fieldErrors.password ? s.inputInvalid : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={!!fieldErrors.password}
                        />
                        {fieldErrors.password && <div className={s.fieldError}>{fieldErrors.password}</div>}
                    </div>

                    <button type="submit" className={s.button} disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </button>
                </form>
            </div>

            <div className={s.under_card}>
                <a href="/register" className={s.link}>
                    Don't have an account? Register!
                </a>
            </div>
        </div>
    );
}
