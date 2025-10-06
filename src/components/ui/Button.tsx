import * as React from "react";
import s from "./Button.module.scss";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className = "", ...rest }: Props) {
    return (
        <button className={[s.button, className].join(" ")} {...rest}>
            {children}
        </button>
    );
}
