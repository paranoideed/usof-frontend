import * as React from "react";

import s from "./ProfileView.module.scss";

type Props = {
    avatar?: string | null;
    username: string;
    pseudonym?: string | null;
    reputation?: number | null;
    createdAt?: Date | null;
    actions?: React.ReactNode; // кнопки (Edit/Logout) или что-то ещё
};

export default function ProfileView({
    avatar,
    username,
    pseudonym,
    reputation,
    createdAt,
    actions,
}: Props) {
    return (
        <div className={s.container}>
            <div className={s.profile}>
                <img
                    className={s.avatar}
                    src={avatar || "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif"}
                    alt="avatar"
                />
                <div className={s.info}>
                    <div className={s.username}>{username}</div>
                    {pseudonym ? <div className={s.pseudonym}>{pseudonym}</div> : null}
                    {typeof reputation === "number" ? (
                        <div><b>Reputation:</b> {reputation}</div>
                    ) : null}
                    {createdAt ? (
                        <div><b>Part since:</b> {new Date(createdAt).toDateString().slice(3)}</div>
                    ) : null}
                </div>
            </div>
            {actions ? <div className={s.actions}>{actions}</div> : null}
        </div>
    );
}
