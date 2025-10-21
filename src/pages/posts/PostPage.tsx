import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import PostFull from "@components/posts/PostFull";
import CommentsSection from "@components/comments/CommentsSection.tsx";

import api from"@features/api.ts";

import type { Post } from "@/features/posts/posts";

import s from "./PostPage.module.scss";

export default function PostPage() {
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [post, setPost] = React.useState<Post | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Простой, надёжный эффект загрузки
    React.useEffect(() => {
        if (!id) return;
        let ignore = false;            // защищаем setState при размонтировании
        setLoading(true);

        (async () => {
            try {
                const res = await api.get<Post>(`/posts/${id}`);
                if (!ignore) setPost(res.data);
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 404) {
                    navigate("/404", { replace: true });
                    return;
                }
                if (!ignore) setError(err?.message || "Failed to load post");
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => { ignore = true; };
    }, [id]);

    if (loading) return <div className={s.loading}>Loading...</div>;
    if (error)   return <div className={s.error}>Error: {error}</div>;
    if (!post)   return <div className={s.empty}>Post not found</div>;

    return (
        <div className={s.root}>
            <NavBar />
            <div className={s.container}>
                <PostFull {...post} />
                {id && <CommentsSection postId={id} />}
            </div>
        </div>
    );
}
