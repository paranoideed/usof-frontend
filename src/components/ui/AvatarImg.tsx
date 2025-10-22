import * as React from "react";
// 1. Импортируем нашу дефолтную картинку
import { DEFAULT_PIC } from "@features/ui.ts";

// 2. Принимаем все стандартные пропсы для <img>
type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export default function AvatarImg(props: Props) {

    // 3. Создаем обработчик ошибки
    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
        // Если картинка по 'src' не загрузилась,
        // принудительно меняем 'src' на дефолтную картинку.
        event.currentTarget.src = DEFAULT_PIC;
    };

    return (
        <img
            {...props} // Передаем все пропсы (src, alt, className...)
            onError={handleImageError} // 4. Добавляем наш обработчик
            alt={"avatar"}
        />
    );
}