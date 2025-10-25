import React from "react";
import { Link, useNavigate } from "react-router-dom";

import RatingPost from "@components/ui/RatingPost";

import type { Post } from "@/features/posts/post";

import s from "./PostSmall.module.scss";
import getUserPic from "@features/ui.ts";
import AvatarImg from "@components/ui/AvatarImg.tsx";

type Props = {
    post: Post;
};

export default function PostSmall({ post }: Props) {
    const navigate = useNavigate();
    const username = post.data.attributes.author_username;

    const rating =
        (post.data.attributes.likes ?? 0) - (post.data.attributes.dislikes ?? 0);

    const goToPost = () => navigate(`/posts/${post.data.id}`);
    const onKeyDownRoot = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToPost();
        }
    };

    console.log("avatar url:", post.data.attributes.author_avatar_url);

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
                    <AvatarImg className={s.avatar} src={getUserPic(post.data.attributes.author_avatar_url)} alt="avatar" />
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
                        {new Date(post.data.attributes.created_at).toDateString().slice(3)}
                    </div>
                </div>
            </div>

            <div className={s.title}>{post.data.attributes.title}</div>

            {post.data.attributes.content && (
                <div className={s.content}>
                    {post.data.attributes.content.length > 220
                        ? post.data.attributes.content.slice(0, 220) + "…"
                        : post.data.attributes.content}
                </div>
            )}
        </div>
        <div className={s.footer}>
            <RatingPost count={rating} />
        </div>
    </article>
    );
}
