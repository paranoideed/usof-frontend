import React from "react";
import {Link, useNavigate} from "react-router-dom";

import type { Post } from "@/features/posts/posts";
import DEFAULT_PIC from "@features/ui";

import s from "./PostSmall.module.scss";

type Props = {
    post: Post;
};

export default function PostSmall({ post }: Props) {
    const navigate = useNavigate();
    const rating = post.data.likes - post.data.dislikes;
    const username = post.data.author_username;

    const goToPost = () => navigate(`/posts/${post.data.id}`);
    const onKeyDownRoot = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToPost();
        }
    };

    return (
            <article
                className={s.root}
                role="link"
                tabIndex={0}
                onClick={goToPost}
                onKeyDown={onKeyDownRoot}
            >
                <div className={s.header}>
                    <div>
                        <img className={s.avatar} src={DEFAULT_PIC} alt="avatar" />
                    </div>
                    <div className={s.meta}>
                        <div className={s.username}>
                            <Link
                                to={`/profiles/u/${username}`}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                {`@${username}`}
                            </Link>
                        </div>
                        <div className={s.date}>
                            {new Date(post.data.created_at).toDateString().slice(3)}
                        </div>

                    </div>
                </div>

                <div className={s.title}>{post.data.title}</div>

                {post.data.content && (
                    <div className={s.content}>
                        {post.data.content.length > 220 ? post.data.content.slice(0, 220) + "..." : post.data.content}
                    </div>
                )}

                <div className={s.footer}>
                    <span>👍 {post.data.likes}</span>
                    <span>👎 {post.data.dislikes}</span>
                    <span>⭐ {rating >= 0 ? `+${rating}` : rating}</span>
                </div>
            </article>
    );
}
