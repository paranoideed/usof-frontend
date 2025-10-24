import * as React from "react";

import s from "./ProfileView.module.scss";
import AvatarImg from "@components/ui/AvatarImg.tsx";
import getUserPic from "@features/ui.ts";

type Props = {
    user_id:  string;
    username:   string;
    pseudonym?: string | null;
    reputation: number;
    created_at: string | Date;
    actions?:   React.ReactNode;
};

export default function ProfileView({
    user_id,
    username,
    pseudonym,
    reputation,
    created_at,
    actions,
}: Props) {
    return (
        <div className={s.container}>
            <div className={s.profile}>
                <AvatarImg
                    className={s.avatar}
                    src={getUserPic(user_id)}
                    alt="avatar"
                />
                <div className={s.info}>
                    <div className={s.username}>@{username}</div>
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
