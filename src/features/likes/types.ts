export type LikeType = "like" | "dislike";
export type MyReaction = LikeType | null;

export function parseMyReaction(s: string | null): MyReaction {
    return s === "like" || s === "dislike" ? s : null;
}
