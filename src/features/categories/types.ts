export type Category = {
    id:          string;
    title:       string;
    description: string;
    created_at:  string;
    updated_at:  string | null;
};

export type ListCategories = {
    data:   Category[];
    limit:  number | null;
    offset: number | null;
    total:  number | null;
};
