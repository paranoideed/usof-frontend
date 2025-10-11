import * as React from "react";

import s from "./ProfileView.module.scss";
import DEFAULT_PIC from "@features/ui.ts";

type Props = {
    avatar?:    string | null;
    username:   string;
    pseudonym?: string | null;
    reputation: number;
    created_at: string | Date;
    actions?:   React.ReactNode;
};

export default function ProfileView({
    avatar,
    username,
    pseudonym,
    reputation,
    created_at,
    actions,
}: Props) {
    return (
        <div className={s.container}>
            <div className={s.profile}>
                <img
                    className={s.avatar}
                    src={avatar || DEFAULT_PIC}
                    alt="avatar"
                />
                <div className={s.info}>
                    <div className={s.username}>{username}</div>
                    {pseudonym ? <div className={s.pseudonym}>{pseudonym}</div> : null}
                    <div><b>Reputation:</b> {reputation}</div>
                    {created_at ? (
                        <div><b>Part since:</b>{
                            new Date(created_at).toDateString().slice(3)
                        }</div>
                    ) : null}
                </div>
            </div>
            {actions ? <div className={s.actions}>{actions}</div> : null}
        </div>
    );
}
