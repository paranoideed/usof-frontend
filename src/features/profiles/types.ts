export type profile = {
    id:         string;
    username:   string;
    pseudonym?: string | null;
    avatar?:    string | null;
    reputation: number;
    created_at: Date;
};



