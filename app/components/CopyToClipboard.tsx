import { useEffect, useState } from "react";
import { encryptId } from "~/utils/idCrypto";
import { Button } from "./Button";
import { useToast } from "./Toast";

type CopyProps = {
    eventId: string;
};

export function Copy({ eventId }: CopyProps) {
    const [baseUrl, setBaseUrl] = useState("");
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();
    const curID = encryptId(String(eventId));

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const linkToForm = `${baseUrl}/form/${curID}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(linkToForm);
            setCopied(true);
            showToast("Sign-up form link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast("Failed to copy link.", "error");
        }
    };

    return (
        <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-0 p-3.5 shadow-card">
            <div className="flex items-center gap-2 overflow-hidden">
                <svg className="h-4 w-4 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="truncate text-xs font-mono text-neutral-600">{linkToForm}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? "Copied!" : "Copy Link"}
            </Button>
        </div>
    );
}