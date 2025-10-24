import { useParams } from "react-router-dom";

import NavBar from "@/components/ui/NavBar";
import ProfileView from "@/components/profiles/ProfileView.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfileBy from "./hooks/useProfileBy";

import s from "./UserProfile.module.scss";

export default function UserProfilePage() {
    const params = useParams();
    const userId = params.user_id;
    const username = params.username;

    const { data, loading, error, status } = useProfileBy(userId, username);

    if (loading) return <div className={s.root}>Loading…</div>;

    return (
        <div className={s.root}>
            <NavBar />
            <div className={s.card}>
                {(!userId && !username) && (
                    <FormError>Neither user_id nor username provided</FormError>
                )}

                {error && (
                    <FormError>{status === 404 ? "User not found" : error}</FormError>
                )}

                {data && (
                    <ProfileView
                        user_id={data.id}
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
