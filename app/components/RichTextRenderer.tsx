import { useState, useMemo } from "react";
import { isHtml, sanitizeHtml } from "~/utils/richTextUtils";

type RichTextRendererProps = {
    content?: string | null;
    className?: string;
    isExpandable?: boolean;
    maxCollapsedHeight?: number; // in pixels
    emptyMessage?: string;
};

export function RichTextRenderer({
    content,
    className = "",
    isExpandable = false,
    maxCollapsedHeight = 280,
    emptyMessage = "No description provided.",
}: RichTextRendererProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isContentHtml = useMemo(() => isHtml(content), [content]);
    const cleanHtml = useMemo(() => (isContentHtml ? sanitizeHtml(content) : ""), [content, isContentHtml]);

    if (!content || !content.trim()) {
        return <p className="text-sm text-neutral-400 italic">{emptyMessage}</p>;
    }

    // Determine if content is long enough to warrant an expand button
    const isLongContent = isExpandable && (content.length > 350 || (content.match(/<img|<h[1-6]|<li/gi)?.length ?? 0) > 3);

    return (
        <div className={`rich-text-container ${className}`}>
            <div
                className={`relative overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                    isLongContent && !isExpanded ? "overflow-hidden" : ""
                }`}
                style={
                    isLongContent && !isExpanded
                        ? { maxHeight: `${maxCollapsedHeight}px` }
                        : undefined
                }
            >
                {isContentHtml ? (
                    <div
                        className="rich-document-prose text-base leading-relaxed text-neutral-700 space-y-3 font-normal"
                        dangerouslySetInnerHTML={{ __html: cleanHtml }}
                    />
                ) : (
                    <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700">
                        {content}
                    </p>
                )}

                {/* Soft fade-out gradient when collapsed */}
                {isLongContent && !isExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-0 to-transparent" />
                )}
            </div>

            {isLongContent && (
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                    <span>{isExpanded ? "Show less" : "Read more"}</span>
                    <svg
                        className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </div>
    );
}
