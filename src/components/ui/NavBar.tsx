import { NavLink } from "react-router-dom";

import AvatarImg from "@components/ui/AvatarImg.tsx";
import { getAvatar, getCurrentUserId, getUsername } from "@features/auth/sessions.ts";
import getUserPic from "@features/ui.ts";

import s from "./NavBar.module.scss";

export default function NavBar() {
    const linkCls = ({ isActive }: { isActive: boolean }) =>
        isActive ? `${s.link} ${s.active}` : s.link;

    const userId = getCurrentUserId();
    const username = getUsername();
    const avatarUrl = getAvatar();

    return (
        <nav className={s.root}>
            <div className={s.inner}>
                <div className={s.brand}>
                    <NavLink to="/posts" className={s.brandLink}>
                        USOF
                    </NavLink>
                </div>

                <ul className={s.menu}>
                    <li>
                        <NavLink to="/posts" className={linkCls} end>
                            Posts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/categories" className={linkCls} end>
                            Categories
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/profiles" className={linkCls} end>
                            Profiles
                        </NavLink>
                    </li>

                    {userId && username ? (
                        <li>
                            <NavLink to="/profiles/me" className={linkCls}>
                                <AvatarImg
                                    className={s.avatar}
                                    src={getUserPic(avatarUrl)}
                                />
                                <div className={s.username}>@{username}</div>
                            </NavLink>
                        </li>
                    ) : (
                        <li>
                            <NavLink to="/login" className={linkCls}>
                                Login
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
