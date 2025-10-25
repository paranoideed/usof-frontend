export type Profile = {
    data: {
        id: string;
        type: "profile"
        attributes: {
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: Date;
            updated_at: Date | null;
        }
    }
};

export type ProfileList = {
    data: {
        id: string;
        type: "profile"
        attributes: {
            username:   string;
            pseudonym:  string | null;
            avatar_url: string | null;
            reputation: number;
            created_at: Date;
            updated_at: Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
};
