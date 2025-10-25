import api from "@features/api.ts";

// export type DeletePostInput = {
//     data: {
//         type: "post";
//         id:   string;
//     }
// }

export async function deletePost(postId: string): Promise<void> {
    // const data: DeletePostInput = {
    //     data: {
    //         type: "post",
    //         id:   postId,
    //     }
    // }
    await api.delete(`/posts/${postId}`);
}