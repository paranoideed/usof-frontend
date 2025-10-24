import * as React from "react";

import NavBar from "@/components/ui/NavBar";
import ProfileMini from "@/components/profiles/ProfileMini.tsx";
import { FormError } from "@/components/ui/FormAlert";

import useProfilesSearch from "./hooks/useProfilesSearch";

import s from "./SearchProfilesPage.module.scss";

export default function SearchProfilesPage() {
    const { q, setQ, data, loading, err, hasMore, limit, offset, setOffset } = useProfilesSearch("", 10);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQ(e.currentTarget.value);
    };

    const loadMore = () => {
        setOffset(offset + limit);
    };

    if (err !== null) console.error(err);

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

                <>
                    {data && data.items.length === 0 ? (
                        <div className={s.nothingFound}>Nothing found</div>
                    ) : (
                        <ul className={s.profilesList}>
                            {(data?.items ?? []).map(u => (
                                <li key={u.id} className={s.profilesListItem}>
                                    <ProfileMini
                                        id={u.id}
                                        username={u.username}
                                        pseudonym={u.pseudonym ?? undefined}
                                        avatar_url={u.avatar_url ?? undefined}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    {hasMore && (
                        <button className={s.more} onClick={loadMore}>
                            Load more
                        </button>
                    )}
                </>
            </div>
        </div>
    );
}
