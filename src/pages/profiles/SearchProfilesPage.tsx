import * as React from "react";

import NavBar from "@/components/ui/NavBar";
import ProfileMini from "@/components/profiles/ProfileMini.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfilesSearch from "./hooks/useProfilesSearch";

import s from "./SearchProfilesPage.module.scss";

export default function SearchProfilesPage() {
    const { q, setQ, data, loading, err, hasMore, limit, offset, setOffset } =
        useProfilesSearch("", 10);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQ(e.currentTarget.value);
    };
    const loadMore = () => setOffset(offset + limit);

    const items = data?.data ?? [];

    return (
        <div className={s.rootForSearch}>
            <NavBar />
            <div className={s.card}>
                <div className={s.controls}>
                    <input
                        className={s.searchProfileInput}
                        value={q}
                        onChange={onChange}
                        placeholder="Type username..."
                        aria-label="Search by username"
                    />
                </div>

                {err && <FormError>{err}</FormError>}

                {loading && <div>Searching...</div>}

                {!loading && items.length === 0 && (
                    <div className={s.nothingFound}>Nothing found</div>
                )}

                {items.length > 0 && (
                    <ul className={s.profilesList}>
                        {items.map((u) => (
                            <li key={u.id} className={s.profilesListItem}>
                                <ProfileMini profile={{ data: u }} />
                            </li>
                        ))}
                    </ul>
                )}

                {hasMore && (
                    <button className={s.more} onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "Load more"}
                    </button>
                )}
            </div>
        </div>
    );
}
