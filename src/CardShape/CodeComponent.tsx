import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import WrapTextIcon from "@mui/icons-material/WrapText";
import { FC, memo, useState, ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as syntaxStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Props {
    className: string;
    children: React.ReactNode;
}

export const CodeComponent: FC<Props> = memo(({ className, children }) => {
    const language = className ? className.replace("lang-", "") : undefined;

    const value = children as string;
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isWrapped, setIsWrapped] = useState<boolean>(true);

    const copyToClipboard = () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }

        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        });
    };

    return (
        <div className="bg-black rounded-md mb-4 mt-4">
            <div className="flex items-center relative text-gray-200 bg-gray-700 gizmo:dark:bg-token-surface-primary px-4 py-2 font-sans justify-between rounded-t-md">
                <span style={{ fontSize: "11pt" }}>{language}</span>

                <div className="flex items-center">
                    {/* wrap text button */}
                    <button
                        className="flex gap-1.5 items-center bg-none p-1 text-xs text-white"
                        onClick={() => setIsWrapped(!isWrapped)}
                    >
                        <WrapTextIcon sx={{ height: "20px" }} />

                        {isWrapped ? "Wrapped" : "Wrap Text"}
                    </button>
                    {/* copy button */}
                    <button
                        className="flex gap-1.5 items-center bg-none p-1 text-xs text-white"
                        onClick={copyToClipboard}
                    >
                        {isCopied ? (
                            <CheckIcon sx={{ height: "20px" }} />
                        ) : (
                            <ContentCopyIcon sx={{ height: "20px" }} />
                        )}
                        {isCopied ? "Copied!" : "Copy Code"}
                    </button>
                </div>
            </div>
            <SyntaxHighlighter
                language={language}
                style={syntaxStyle}
                wrapLines={isWrapped}
                lineProps={{
                    style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
                }}
                customStyle={{
                    margin: 0,
                    padding: "1.2rem",
                    overflowX: "auto", // this might be optional depending on your requirements
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
});
CodeComponent.displayName = "CodeBlock";

interface PreBlockProps {
    children: ReactNode;
}

const PreBlock: React.FC<PreBlockProps> = ({ children, ...props }) => {
    if (
        children &&
        typeof children === "object" &&
        "type" in children &&
        children["type"] === "code"
    ) {
        return (
            <CodeComponent className={children.props.className}>
                {children.props.children}
            </CodeComponent>
        );
    }
    return <pre {...props}>{children}</pre>;
};

export default PreBlock;
