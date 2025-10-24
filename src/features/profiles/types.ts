export type Profile = {
    id:          string;
    username:    string;
    pseudonym?:  string | null;
    avatar_url?: string | null;
    reputation:  number;
    created_at:  Date;
};

export type ProfileList = {
    items:  Profile[];
    total:  number;
    limit:  number;
    offset: number;
};
