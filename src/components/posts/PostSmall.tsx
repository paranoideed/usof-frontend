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

export default function PostSmall(params: Props) {
    const navigate = useNavigate();

    const username = params.post.data.attributes.author_username;
    const avatarUrl = params.post.data.attributes.author_avatar_url;
    const title = params.post.data.attributes.title;
    const createdAt = params.post.data.attributes.created_at;
    const content = params.post.data.attributes.content;
    const rating = (params.post.data.attributes.likes ?? 0) - (params.post.data.attributes.dislikes ?? 0);

    const goToPost = () => navigate(`/posts/${params.post.data.id}`);
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
                    <AvatarImg className={s.avatar} src={getUserPic(avatarUrl)} alt="avatar" />
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
                        {new Date(createdAt).toDateString().slice(3)}
                    </div>
                </div>
            </div>

            <div className={s.title}>{title}</div>

            {content && (
                <div className={s.content}>
                    {content.length > 220 ? content.slice(0, 220) + "…" : content}
                </div>
            )}
        </div>
        <div className={s.footer}>
            <RatingPost count={rating} />
        </div>
    </article>
    );
}
