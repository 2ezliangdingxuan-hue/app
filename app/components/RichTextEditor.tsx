import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { isHtml } from "~/utils/richTextUtils";
import { RichTextRenderer } from "./RichTextRenderer";

type RichTextEditorProps = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
};

const FONT_FAMILIES = [
    { label: "Default (Sans)", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
    { label: "Classic Serif", value: "Georgia, 'Times New Roman', serif" },
    { label: "Monospace", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
    { label: "Elegant Display", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
    { label: "Playful / Cursive", value: "'Segoe Print', 'Comic Sans MS', cursive" },
];

const FONT_SIZES = [
    { label: "Small (13px)", value: "2" }, // font size 2 corresponds to ~13px in execCommand
    { label: "Normal (16px)", value: "3" }, // standard 16px
    { label: "Medium (18px)", value: "4" }, // ~18px
    { label: "Large (24px)", value: "5" }, // ~24px
    { label: "Title (32px)", value: "6" }, // ~32px
];

const TEXT_COLORS = [
    { label: "Charcoal", value: "#221e19" },
    { label: "Forest Green", value: "#2c633b" },
    { label: "Warm Amber", value: "#d1850f" },
    { label: "Burgundy", value: "#b91c1c" },
    { label: "Navy Blue", value: "#1d4ed8" },
    { label: "Plum Purple", value: "#7e22ce" },
    { label: "Stone Muted", value: "#6b6155" },
];

const HIGHLIGHT_COLORS = [
    { label: "None", value: "transparent" },
    { label: "Amber Yellow", value: "#fef3c7" },
    { label: "Mint Green", value: "#dcfce7" },
    { label: "Sky Blue", value: "#e0f2fe" },
    { label: "Rose Pink", value: "#ffe4e6" },
];

export function RichTextEditor({
    value = "",
    onChange,
    placeholder = "Write your event details, agenda, and story here...",
    className = "",
    minHeight = "220px",
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isImageUrlPromptOpen, setIsImageUrlPromptOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);

    // Save selection range when opening modal prompts
    const saveCurrentSelection = () => {
        if (typeof window === "undefined") return;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedSelection(sel.getRangeAt(0).cloneRange());
        }
    };

    const restoreSelection = () => {
        if (typeof window === "undefined" || !savedSelection) return;
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(savedSelection);
        }
    };

    // Synchronize initial value into contentEditable DOM element
    useEffect(() => {
        if (!editorRef.current) return;
        const currentHtml = editorRef.current.innerHTML;

        // Convert plain text to paragraph tags if not already HTML
        const formattedInitial = value
            ? isHtml(value)
                ? value
                : value
                      .split("\n\n")
                      .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
                      .join("")
            : "";

        if (currentHtml !== formattedInitial) {
            editorRef.current.innerHTML = formattedInitial;
        }
    }, [value]);

    const handleInput = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        onChange?.(html);
    };

    const exec = (command: string, arg?: string) => {
        if (typeof document === "undefined") return;
        document.execCommand(command, false, arg);
        handleInput();
        editorRef.current?.focus();
    };

    const handleFontFamily = (e: ChangeEvent<HTMLSelectElement>) => {
        const font = e.target.value;
        if (!font) return;
        exec("fontName", font);
        e.target.value = "";
    };

    const handleFontSize = (e: ChangeEvent<HTMLSelectElement>) => {
        const size = e.target.value;
        if (!size) return;
        exec("fontSize", size);
        e.target.value = "";
    };

    const handleFormatBlock = (e: ChangeEvent<HTMLSelectElement>) => {
        const tag = e.target.value;
        if (!tag) return;
        exec("formatBlock", tag);
        e.target.value = "";
    };

    const handleTextColor = (color: string) => {
        restoreSelection();
        exec("foreColor", color);
        setIsColorPickerOpen(false);
    };

    const handleHighlightColor = (color: string) => {
        restoreSelection();
        if (color === "transparent") {
            exec("removeFormat");
        } else {
            exec("hiliteColor", color);
        }
        setIsHighlightPickerOpen(false);
    };

    const handleInsertImageFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            restoreSelection();
            exec("insertImage", dataUrl);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsDataURL(file);
    };

    const handleInsertImageUrlSubmit = () => {
        if (!imageUrl.trim()) {
            setIsImageUrlPromptOpen(false);
            return;
        }
        restoreSelection();
        exec("insertImage", imageUrl.trim());
        setImageUrl("");
        setIsImageUrlPromptOpen(false);
    };

    const handleInsertLinkSubmit = () => {
        if (!linkUrl.trim()) {
            setIsLinkPromptOpen(false);
            return;
        }
        restoreSelection();
        let targetUrl = linkUrl.trim();
        if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith("mailto:") && !targetUrl.startsWith("/")) {
            targetUrl = `https://${targetUrl}`;
        }
        exec("createLink", targetUrl);
        setLinkUrl("");
        setIsLinkPromptOpen(false);
    };

    return (
        <div className={`flex flex-col rounded-xl border border-neutral-300 bg-neutral-0 shadow-sm transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 ${className}`}>
            {/* Header Tabs: Edit / Preview */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs">
                <div className="flex items-center gap-1 font-medium text-neutral-600">
                    <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`rounded-md px-2.5 py-1 transition-colors ${
                            activeTab === "edit"
                                ? "bg-neutral-0 text-brand-700 shadow-xs font-semibold"
                                : "hover:text-neutral-900"
                        }`}
                    >
                        Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`rounded-md px-2.5 py-1 transition-colors ${
                            activeTab === "preview"
                                ? "bg-neutral-0 text-brand-700 shadow-xs font-semibold"
                                : "hover:text-neutral-900"
                        }`}
                    >
                        Live Preview
                    </button>
                </div>
                <span className="text-neutral-400">Rich Document</span>
            </div>

            {/* Formatting Toolbar (Only displayed on Edit tab) */}
            {activeTab === "edit" && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 bg-neutral-0 px-2.5 py-2 text-neutral-700">
                    {/* Structure / Heading Dropdown */}
                    <select
                        onChange={handleFormatBlock}
                        defaultValue=""
                        className="h-8 rounded-md border border-neutral-200 bg-neutral-0 px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        title="Heading & Format"
                    >
                        <option value="" disabled>Format</option>
                        <option value="<p>">Normal Paragraph</option>
                        <option value="<h1>">Heading 1 (Large)</option>
                        <option value="<h2>">Heading 2 (Medium)</option>
                        <option value="<h3>">Heading 3 (Small)</option>
                        <option value="<blockquote>">Blockquote</option>
                    </select>

                    {/* Font Family Dropdown */}
                    <select
                        onChange={handleFontFamily}
                        defaultValue=""
                        className="h-8 rounded-md border border-neutral-200 bg-neutral-0 px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer max-w-[120px] sm:max-w-none"
                        title="Font Family"
                    >
                        <option value="" disabled>Font</option>
                        {FONT_FAMILIES.map((font) => (
                            <option key={font.label} value={font.value} style={{ fontFamily: font.value }}>
                                {font.label}
                            </option>
                        ))}
                    </select>

                    {/* Font Size Dropdown */}
                    <select
                        onChange={handleFontSize}
                        defaultValue=""
                        className="h-8 rounded-md border border-neutral-200 bg-neutral-0 px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        title="Font Size"
                    >
                        <option value="" disabled>Size</option>
                        {FONT_SIZES.map((size) => (
                            <option key={size.label} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>

                    <div className="h-5 w-px bg-neutral-200 mx-0.5" />

                    {/* Basic Styling Buttons */}
                    <button
                        type="button"
                        onClick={() => exec("bold")}
                        className="flex h-8 w-8 items-center justify-center rounded-md font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Bold (Ctrl+B)"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("italic")}
                        className="flex h-8 w-8 items-center justify-center rounded-md italic font-serif text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Italic (Ctrl+I)"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("underline")}
                        className="flex h-8 w-8 items-center justify-center rounded-md underline text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Underline (Ctrl+U)"
                    >
                        U
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("strikeThrough")}
                        className="flex h-8 w-8 items-center justify-center rounded-md line-through text-neutral-700 hover:bg-neutral-100 transition-colors text-xs"
                        title="Strikethrough"
                    >
                        S
                    </button>

                    <div className="h-5 w-px bg-neutral-200 mx-0.5" />

                    {/* Text Color Picker Popover */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                saveCurrentSelection();
                                setIsColorPickerOpen((prev) => !prev);
                                setIsHighlightPickerOpen(false);
                            }}
                            className="flex h-8 items-center gap-1 rounded-md px-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Text Color"
                        >
                            <span>Color</span>
                            <span className="h-3 w-3 rounded-full border border-neutral-300 bg-brand-600" />
                        </button>
                        {isColorPickerOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1 flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-2 shadow-card">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Text Color</div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {TEXT_COLORS.map((c) => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleTextColor(c.value)}
                                            className="h-6 w-6 rounded-md border border-neutral-200 shadow-xs hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c.value }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Color Picker Popover */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                saveCurrentSelection();
                                setIsHighlightPickerOpen((prev) => !prev);
                                setIsColorPickerOpen(false);
                            }}
                            className="flex h-8 items-center gap-1 rounded-md px-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Highlight Color"
                        >
                            <span>Highlight</span>
                            <span className="h-3 w-3 rounded-md border border-neutral-300 bg-accent-400" />
                        </button>
                        {isHighlightPickerOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1 flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-2 shadow-card">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Highlight</div>
                                <div className="flex gap-1.5">
                                    {HIGHLIGHT_COLORS.map((c) => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => handleHighlightColor(c.value)}
                                            className="h-6 w-6 rounded-md border border-neutral-300 shadow-xs hover:scale-110 transition-transform flex items-center justify-center text-[10px]"
                                            style={{ backgroundColor: c.value }}
                                            title={c.label}
                                        >
                                            {c.value === "transparent" ? "✕" : ""}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-5 w-px bg-neutral-200 mx-0.5" />

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => exec("insertUnorderedList")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Bulleted List"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <line x1="9" y1="6" x2="20" y2="6" />
                            <line x1="9" y1="12" x2="20" y2="12" />
                            <line x1="9" y1="18" x2="20" y2="18" />
                            <circle cx="4" cy="6" r="2" fill="currentColor" />
                            <circle cx="4" cy="12" r="2" fill="currentColor" />
                            <circle cx="4" cy="18" r="2" fill="currentColor" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("insertOrderedList")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors text-xs font-semibold"
                        title="Numbered List"
                    >
                        1.
                    </button>

                    {/* Alignment */}
                    <button
                        type="button"
                        onClick={() => exec("justifyLeft")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Align Left"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h14" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => exec("justifyCenter")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Align Center"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" d="M4 6h16M7 12h10M5 18h14" />
                        </svg>
                    </button>

                    <div className="h-5 w-px bg-neutral-200 mx-0.5" />

                    {/* Divider Rule */}
                    <button
                        type="button"
                        onClick={() => exec("insertHorizontalRule")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors text-xs"
                        title="Insert Divider"
                    >
                        ―
                    </button>

                    {/* Link */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                saveCurrentSelection();
                                setIsLinkPromptOpen((prev) => !prev);
                                setIsImageUrlPromptOpen(false);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Insert Link"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </button>
                        {isLinkPromptOpen && (
                            <div className="absolute right-0 top-full z-20 mt-1 flex w-64 flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-3 shadow-card">
                                <span className="text-xs font-semibold text-neutral-800">Insert Link</span>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="h-8 rounded border border-neutral-300 px-2 text-xs focus:border-brand-500 focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleInsertLinkSubmit();
                                        }
                                    }}
                                />
                                <div className="flex justify-end gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsLinkPromptOpen(false)}
                                        className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleInsertLinkSubmit}
                                        className="rounded bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                                    >
                                        Insert
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Upload from Device */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInsertImageFile}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            saveCurrentSelection();
                            fileInputRef.current?.click();
                        }}
                        className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Upload Image"
                    >
                        <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span>Image</span>
                    </button>

                    {/* Image via URL */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                saveCurrentSelection();
                                setIsImageUrlPromptOpen((prev) => !prev);
                                setIsLinkPromptOpen(false);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Insert Image from URL"
                        >
                            <span className="text-xs font-bold text-neutral-600">URL</span>
                        </button>
                        {isImageUrlPromptOpen && (
                            <div className="absolute right-0 top-full z-20 mt-1 flex w-64 flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-0 p-3 shadow-card">
                                <span className="text-xs font-semibold text-neutral-800">Insert Image via URL</span>
                                <input
                                    type="url"
                                    placeholder="https://example.com/photo.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="h-8 rounded border border-neutral-300 px-2 text-xs focus:border-brand-500 focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleInsertImageUrlSubmit();
                                        }
                                    }}
                                />
                                <div className="flex justify-end gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsImageUrlPromptOpen(false)}
                                        className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleInsertImageUrlSubmit}
                                        className="rounded bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                                    >
                                        Insert
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-5 w-px bg-neutral-200 mx-0.5" />

                    {/* Clear Formatting */}
                    <button
                        type="button"
                        onClick={() => exec("removeFormat")}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors text-xs"
                        title="Clear Formatting"
                    >
                        T⃠
                    </button>
                </div>
            )}

            {/* Editor Canvas or Live Preview */}
            <div className="p-3">
                {activeTab === "edit" ? (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        style={{ minHeight }}
                        className="rich-document-prose outline-none text-base text-neutral-800 focus:outline-none font-normal"
                        data-placeholder={placeholder}
                    />
                ) : (
                    <div style={{ minHeight }} className="p-2 border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
                        <RichTextRenderer content={editorRef.current?.innerHTML || value} emptyMessage="Nothing to preview yet. Switch to Editor to start writing." />
                    </div>
                )}
            </div>
        </div>
    );
}
