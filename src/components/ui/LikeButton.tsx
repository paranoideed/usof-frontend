import * as React from "react";

import s from "./LikeButton.module.scss";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    count?: number;
};

export default function LikeButton({
        className = "",
        active = false,
        count = 0,
        children,
        ...rest
    }: Props) {
    return (
        <button
            className={[s.like, active ? s.active : "", className].join(" ")}
            aria-pressed={active}
            {...rest}
        >
            <span className={s.icon} aria-hidden>👍</span>
            <span className={s.count}>{count}</span>
            {children ? <span className={s.label}>{children}</span> : null}
        </button>
    );
}
