import { Link, useNavigate } from "react-router-dom";
import s from "./NotFoundPage.module.scss";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className={s.page}>
            <div className={s.card}>
                <div className={s.code}>404</div>
                <h1 className={s.title}>Page not found</h1>
                <p className={s.text}>
                    The page you’re looking for doesn’t exist or has been moved.
                </p>
                <div className={s.actions}>
                    <button className={s.primary} onClick={() => navigate(-1)}>Go back</button>
                    <Link className={s.ghost} to="/">Go to home</Link>
                </div>
            </div>
        </div>
    );
}
