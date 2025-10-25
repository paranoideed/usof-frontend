export type Category = {
    data: CategoryData
}

export type CategoryData = {
    id: string;
    type: "category"
    attributes: {
        title:        string;
        description: string | null;
        created_at:  Date;
        updated_at:  Date | null;
    }
}

export type CategoryList = {
    data: {
        id: string;
        type: "category"
        attributes: {
            title:        string;
            description: string | null;
            created_at:  Date;
            updated_at:  Date | null;
        }
    }[];
    meta: {
        total:  number;
        limit:  number;
        offset: number;
    }
}