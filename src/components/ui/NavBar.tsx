import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import AvatarImg from "@components/ui/AvatarImg.tsx";
import {getAvatar, getCurrentUserId, getUsername} from "@features/auth/sessions.ts";

import s from "./NavBar.module.scss";
import getUserPic from "@features/ui.ts";

export default function NavBar() {
    const linkCls = ({ isActive }: { isActive: boolean }) =>
        isActive ? `${s.link} ${s.active}` : s.link;

    const navigate = useNavigate();

    const userId = getCurrentUserId();
    const username = getUsername();
    const avatarUrl = getAvatar();

    React.useEffect(() => {
        if (!username) {
            navigate("/login", { replace: true });
        }
        if (!userId) {
            navigate("/login", { replace: true });
        }
    }, [navigate, userId, username]);

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
                    <li>
                        <NavLink to="/profiles/me" className={linkCls}>
                            <AvatarImg
                                className={s.avatar}
                                src={getUserPic(avatarUrl)}
                            />
                            @{username}
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}