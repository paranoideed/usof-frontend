import * as React from "react";

import AvatarImg from "@components/ui/AvatarImg.tsx";
import getUserPic from "@features/ui.ts";

import type {Profile} from "@features/profiles/profile.ts";

import s from "./ProfileView.module.scss";

type Props = {
    profile:  Profile;
    actions?: React.ReactNode;
};

export default function ProfileView(params: Props) {
    console.log("Rendering ProfileView for", params.profile);
    return (
        <div className={s.container}>
            <div className={s.profile}>
                <AvatarImg
                    className={s.avatar}
                    src={getUserPic(params.profile.data.attributes.avatar_url)}
                    alt="avatar"
                />
                <div className={s.info}>
                    <div className={s.username}>@{params.profile.data.attributes.username}</div>
                    {params.profile.data.attributes.pseudonym ? <div className={s.pseudonym}>{params.profile.data.attributes.pseudonym}</div> : null}
                    <div><b>Reputation:</b> {params.profile.data.attributes.reputation}</div>
                    {params.profile.data.attributes.created_at ? (
                        <div><b>Part since:</b>{
                            new Date(params.profile.data.attributes.created_at).toDateString().slice(3)
                        }</div>
                    ) : null}
                </div>
            </div>
            {params.actions ? <div className={s.actions}>{params.actions}</div> : null}
        </div>
    );
}
