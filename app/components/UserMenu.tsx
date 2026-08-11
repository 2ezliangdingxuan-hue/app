import { useEffect, useRef, useState } from "react";

type UserMenuProps = {
    name: string;
    onSignOut: () => void;
    className?: string;
};

export function UserMenu({ name, onSignOut, className = "" }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className="flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
            >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                    {name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="max-w-[10rem] truncate">{name}</span>
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-neutral-200 bg-neutral-0 py-1 shadow-modal"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setIsOpen(false);
                            onSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}
