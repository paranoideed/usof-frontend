import { Link } from "react-router-dom";

import s from "./ProfileMini.module.scss";
import AvatarImg from "@components/ui/AvatarImg.tsx";
import getUserPic from "@features/ui.ts";

import type {Profile} from "@features/profiles/types.ts";

type Props = {
    profile: Profile;
};

export default function ProfileMini(param: Props) {
    return (
        <Link to={`/profiles/id/${param.profile.data.id}`} className={s.item}>
            <AvatarImg
                className={s.avatar}
                src={getUserPic(param.profile.data.attributes.avatar_url)}
                alt="avatar"
            />
            <div className={s.meta}>
                <div className={s.username}>{param.profile.data.attributes.username}</div>
                {param.profile.data.attributes.pseudonym ? <div className={s.pseudonym}>
                    {param.profile.data.attributes.pseudonym}
                </div> : null}
            </div>
        </Link>
    );
}
