import { Link } from "react-router-dom";

import s from "./ProfileMini.module.scss";

type Props = {
    id: string;
    username: string;
    pseudonym?: string | null;
    avatar?: string | null;
    to?: string; // опционально: ссылка, по умолчанию /profiles/id/:id
};

export default function ProfileMini({ id, username, pseudonym, avatar, to }: Props) {
    const href = to ?? `/profiles/id/${id}`;
    return (
        <Link to={href} className={s.item}>
            <img
                className={s.avatar}
                src={avatar || "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif"}
                alt="avatar"
            />
            <div className={s.meta}>
                <div className={s.username}>{username}</div>
                {pseudonym ? <div className={s.pseudonym}>{pseudonym}</div> : null}
            </div>
        </Link>
    );
}
