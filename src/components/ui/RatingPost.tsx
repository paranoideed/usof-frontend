import s from "./RatingPost.module.scss";

type Props = {
    count: number;
};

export default function RatingPost({ count }: Props) {
    return (
        <div className={s.rating}>
            <span className={s.count}>⭐ {count >= 0 ? `+${count}` : count}</span>
        </div>
    );
}
