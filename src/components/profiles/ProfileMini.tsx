import { Link } from "react-router-dom";

import s from "./ProfileMini.module.scss";
import AvatarImg from "@components/ui/AvatarImg.tsx";
import getUserPic from "@features/ui.ts";

type Props = {
    id: string;
    username: string;
    pseudonym?: string | null;
    avatar_url?: string | null;
    to?: string;
};

export default function ProfileMini({ id, username, pseudonym, avatar_url, to }: Props) {
    const href = to ?? `/profiles/id/${id}`;
    return (
        <Link to={href} className={s.item}>
            <AvatarImg
                className={s.avatar}
                src={getUserPic(avatar_url)}
                alt="avatar"
            />
            <div className={s.meta}>
                <div className={s.username}>{username}</div>
                {pseudonym ? <div className={s.pseudonym}>{pseudonym}</div> : null}
            </div>
        </Link>
    );
}
