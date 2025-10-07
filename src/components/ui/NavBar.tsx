import { NavLink } from "react-router-dom";
import s from "./NavBar.module.scss";

export default function NavBar() {
    const linkCls = ({ isActive }: { isActive: boolean }) =>
        isActive ? `${s.link} ${s.active}` : s.link;

    return (
        <nav className={s.root}>
            <div className={s.inner}>
                <div className={s.brand}>
                    <NavLink to="/posts" className={s.brandLink}>USOF</NavLink>
                </div>

                <ul className={s.menu}>
                    <li><NavLink to="/themas" className={linkCls} end>Themas</NavLink></li>
                    <li><NavLink to="/profiles" className={linkCls} end>Profiles</NavLink></li>
                    <li><NavLink to="/profiles/me" className={linkCls}>Me</NavLink></li>
                </ul>
            </div>
        </nav>
    );
}
