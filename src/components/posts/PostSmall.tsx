import React from "react";
import { Link, useNavigate } from "react-router-dom";

import RatingPost from "@components/ui/RatingPost";

import type { Post } from "@/features/posts/posts";

import s from "./PostSmall.module.scss";
import getUserPic from "@features/ui.ts";
import AvatarImg from "@components/ui/AvatarImg.tsx";

type Props = {
    post: Post;
};

export default function PostSmall({ post }: Props) {
    const navigate = useNavigate();
    const username = post.data.author_username;

    const rating =
        (post.data.likes ?? 0) - (post.data.dislikes ?? 0);

    const goToPost = () => navigate(`/posts/${post.data.id}`);
    const onKeyDownRoot = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToPost();
        }
    };

    return (
    <article className={s.container}>
        <div
            className={s.root}
            role="link"
            tabIndex={0}
            onClick={goToPost}
            onKeyDown={onKeyDownRoot}
        >
            <div className={s.header}>
                <div>
                    <AvatarImg className={s.avatar} src={getUserPic(post.data.author_id)} alt="avatar" />
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
                    {post.data.content.length > 220
                        ? post.data.content.slice(0, 220) + "…"
                        : post.data.content}
                </div>
            )}
        </div>
        <div className={s.footer}>
            <RatingPost count={rating} />
        </div>
    </article>
    );
}
