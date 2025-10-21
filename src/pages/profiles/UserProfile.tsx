import { useParams } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import ProfileView from "@/components/profiles/ProfileView.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfileBy from "./hooks/useProfileBy";

import s from "./UserProfile.module.scss";

export default function UserProfilePage() {
    const { user_id, username } = useParams<{ user_id?: string; username?: string }>();
    const { data, loading, error, status } = useProfileBy({ id: user_id ?? null, username: username ?? null });

    if (loading) return <div className={s.root}>Loading…</div>;

    return (
        <div className={s.root}>
            <NavBar />
            <div className={s.card}>
                {(!user_id && !username) && (
                    <FormError>Neither user_id nor username provided</FormError>
                )}

                {error && (
                    <FormError>{status === 404 ? "User not found" : error}</FormError>
                )}

                {data && (
                    <ProfileView
                        avatar={data.avatar}
                        username={data.username}
                        pseudonym={data.pseudonym ?? undefined}
                        reputation={data.reputation}
                        created_at={data.created_at}
                    />
                )}
            </div>
        </div>
    );
}
