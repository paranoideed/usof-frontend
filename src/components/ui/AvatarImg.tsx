import * as React from "react";
import { DEFAULT_PIC } from "@features/ui.ts";

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export default function AvatarImg(props: Props) {

    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
        event.currentTarget.src = DEFAULT_PIC;
    };

    return (
        <img
            {...props}
            onError={handleImageError}
            alt={"avatar"}
        />
    );
}