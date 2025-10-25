import * as React from "react";
import { useLocation, useNavigate, createSearchParams } from "react-router-dom";

import s from "./LoginRequiredModal.module.scss";
import {createPortal} from "react-dom";

export default function LoginRequiredModal(props: {
    open: boolean;
    onClose: () => void;
    redirectTo?: string;
    title?: string;
    message?: string;
    loginPath?: string;
}) {
    const { open, onClose } = props;
    const title = props.title ?? "Требуется вход";
    const message = props.message ?? "Чтобы продолжить, войдите в аккаунт.";
    const loginPath = props.loginPath ?? "/login";


    const navigate = useNavigate();
    const location = useLocation();


    const redirectTo = React.useMemo(() => {
        if (props.redirectTo) return props.redirectTo;
// Вернём пользователя на текущую страницу после логина
        const full = location.pathname + (location.search || "") + (location.hash || "");
        return full || "/";
    }, [location, props.redirectTo]);


// Блокируем скролл, пока открыто
    React.useEffect(() => {
        if (!open) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [open]);


// Закрытие по Escape
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);


    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };


    const gotoLogin = () => {
        const search = createSearchParams({ redirectTo }).toString();
        navigate({ pathname: loginPath, search: search ? `?${search}` : "" });
    };


    if (!open) return null;


    // @ts-ignore
    const modal = (
        <div className={s.backdrop} onMouseDown={onBackdropClick}>
            <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
                <div className={s.header}>
                    <h3 id="login-modal-title" className={s.title}>{title}</h3>
                    <button onClick={onClose} aria-label="Close" className={s.closeBtn}>×</button>
                </div>
                <div className={s.body}>
                    <p className={s.message}>{message}</p>
                </div>
                <div className={s.footer}>
                    <button onClick={onClose} className={s.secondary}>Cancel</button>
                    <button onClick={gotoLogin} className={s.primary}>Login</button>
                </div>
            </div>
        </div>
    );

    const portalRoot = document.getElementById("modal-root") || document.body;
    return createPortal(modal, portalRoot);
}