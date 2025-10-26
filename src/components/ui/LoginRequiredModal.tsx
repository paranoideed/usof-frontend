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
    const title = props.title ?? "Need to Login";
    const message = props.message ?? "You must be logged in to perform this action. Please log in to continue.";
    const loginPath = props.loginPath ?? "/login";

    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = React.useMemo(() => {
        if (props.redirectTo) return props.redirectTo;
        const full = location.pathname + (location.search || "") + (location.hash || "");
        return full || "/";
    }, [location, props.redirectTo]);

    React.useEffect(() => {
        if (!open) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [open]);

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