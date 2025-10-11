import s from "./Fab.module.scss";

type Props = {
    onClick?: () => void;
    title?: string;
};

export default function Fab({ onClick, title = "Create" }: Props) {
    return (
        <button className={s.fab} onClick={onClick} aria-label={title} title={title}>
            +
        </button>
    );
}
