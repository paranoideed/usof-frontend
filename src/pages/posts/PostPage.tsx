import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "@/components/ui/NavBar";
import { api } from "@/features/client";
import s from "./PostPage.module.scss";
import PostFull from "@components/posts/PostFull.tsx";

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/posts/${id}`)
            .then(res => setPost(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className={s.loading}>Loading...</div>;
    if (error) return <div className={s.error}>Error: {error}</div>;
    if (!post) return <div className={s.empty}>Post not found</div>;

    return (
        <div className={s.root}>
            <NavBar />
            <div className={s.container}>
                <PostFull {...post} />
            </div>
        </div>
    );
}
