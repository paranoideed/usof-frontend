import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

// Можно подключить тему подсветки (глобально один раз)
import "highlight.js/styles/github-dark.css";

type Props = { children: string };

export default function MarkdownView({ children }: Props) {
    return (
        <ReactMarkdown
            // GitHub-markdown плюшки: таблицы, чекбоксы и т.п.
            remarkPlugins={[remarkGfm]}
            // Подсветка + санитайз (XSS safety)
            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            // Классы для элементов — чтобы красивее стилить
            components={{
                pre(props) {
                    return <pre className="md-pre" {...props} />;
                },
                code(props) {
                    const { className, children, ...rest } = props;
                    return (
                        <code className={`md-code ${className || ""}`} {...rest}>
                            {children}
                        </code>
                    );
                },
                p(props) {
                    return <p className="md-p" {...props} />;
                },
                a(props) {
                    return <a target="_blank" rel="noopener noreferrer" {...props} />;
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
