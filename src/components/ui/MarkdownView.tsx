import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";

import "./MarkdownView.module.scss"

type Props = { children: string };

export default function MarkdownView({ children }: Props) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            components={{
                pre(props) {
                    return <pre className="md-pre" {...props} />;
                },
                code(props) {
                    const { className, children, ...rest } = props;
                    return (
                        <code className={`code md-code ${className || ""}`} {...rest}>
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
