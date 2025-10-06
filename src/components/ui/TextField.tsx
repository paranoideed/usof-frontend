import * as React from "react";
import s from "./TextField.module.scss";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export default function TextField({ label, error, className = "", ...rest }: Props) {
    const invalid = !!error;
    return (
        <div className={s.group}>
            <label className={s.label}>{label}</label>
            <input
                {...rest}
                className={[s.input, invalid ? s.inputInvalid : "", className].join(" ")}
                aria-invalid={invalid}
            />
            {invalid && <div className={s.error}>{error}</div>}
        </div>
    );
}
