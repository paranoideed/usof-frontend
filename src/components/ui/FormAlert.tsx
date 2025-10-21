import * as React from "react";

import s from "./FormAlert.module.scss";

type Props = {
    children: React.ReactNode;
};

export function FormError({ children }: Props) {
    return <div className={s.error}>{children}</div>;
}

export function FormOk({ children }: Props) {
    return <div className={s.ok}>{children}</div>;
}
