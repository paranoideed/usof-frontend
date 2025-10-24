export const DEFAULT_PIC = "https://media.tenor.com/lKS-KXz-g80AAAAM/killua-hot-dog.gif";

export default function getUserPic(avatar?: string | null): string {
    if (!avatar) {
        return DEFAULT_PIC;
    }
    return avatar;
}
