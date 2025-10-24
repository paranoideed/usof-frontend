export const DEFAULT_PIC = "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif";

export default function getUserPic(userId?: string | null): string {
    if (!userId) {
        return DEFAULT_PIC;
    }
    return `https://usof-s3.s3.eu-north-1.amazonaws.com/user/${userId}/avatar.png`;
}