import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { events, checkInGuest, getGuest } from "../../server/events";
import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { useToast } from "~/components/Toast";
import { useAuth } from "~/auth/AuthContext";
import { decryptId } from "~/utils/idCrypto";
import { formatDateRange } from "~/utils/dateUtils";

type ScanStatus = "checked-in" | "duplicate" | "error";

type ScanEntry = {
    key: string;
    guestId: string;
    name?: string;
    status: ScanStatus;
    message: string;
    timestamp: string;
};

const STATUS_LABELS: Record<ScanStatus, string> = {
    "checked-in": "Checked in",
    duplicate: "Duplicate",
    error: "Error",
};

export function QrScan() {
    const STORAGE_KEY = "Scanned";
    const [scanned, setScanned] = useState<ScanEntry[]>([]);
    const hydrated = useRef(false);
    const guestNamesRef = useRef<Map<string, string>>(new Map());
    const { showToast } = useToast();
    const { account } = useAuth();

    const ownedIds = account?.eventIds || [];
    const scannableEvents = events.filter(
        (event) => ownedIds.includes(event.id) || (account && (event.collaboratorIds || []).includes(account.id))
    );

    const [lastScanResult, setLastScanResult] = useState<{
        status: ScanStatus;
        title: string;
        subtitle?: string;
    } | null>(null);

    const [manualSearch, setManualSearch] = useState("");
    const [eventId, setEventId] = useState<number>(-1);
    const eventIdRef = useRef(eventId);
    useEffect(() => {
        eventIdRef.current = eventId;
    }, [eventId]);

    const lastScannedRef = useRef<string | null>(null);
    const scannedKeysRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setScanned(JSON.parse(saved));
        } catch {}
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (!hydrated.current) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scanned));
    }, [scanned]);

    function logScan(entry: ScanEntry) {
        setScanned((prev) => [...prev, entry]);
    }

    async function handleScan(value: string) {
        const pos = value.indexOf(":");
        const guestEvent = decryptId(value.slice(0, pos));
        const guestId = decryptId(value.slice(pos + 1));
        const key = `${guestEvent}:${guestId}`;

        if (String(eventIdRef.current) !== guestEvent) {
            const message = "Wrong Event QR Code!";
            setLastScanResult({
                status: "error",
                title: "Event Mismatch",
                subtitle: "This ticket belongs to a different event.",
            });
            logScan({ key, guestId, status: "error", message, timestamp: new Date().toISOString() });
            showToast("QR code does not match this event.", "error");
            return;
        }

        if (scannedKeysRef.current.has(key)) {
            const guestName = guestNamesRef.current.get(key) || guestId;
            setLastScanResult({
                status: "duplicate",
                title: "Already Checked In",
                subtitle: `${guestName} was already scanned earlier.`,
            });
            logScan({
                key,
                guestId,
                name: guestName,
                status: "duplicate",
                message: "Guest already scanned",
                timestamp: new Date().toISOString(),
            });
            showToast(`${guestName} is already checked in.`, "info");
            return;
        }

        try {
            await checkInGuest(String(eventIdRef.current), guestId);
            const checkIn = await getGuest(guestEvent, guestId);

            if (checkIn) {
                scannedKeysRef.current.add(key);
                guestNamesRef.current.set(key, checkIn.name ?? guestId);
                const guestName = checkIn.name ?? guestId;
                setLastScanResult({
                    status: "checked-in",
                    title: `Checked In: ${guestName}`,
                    subtitle: `Arrival recorded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                });
                logScan({
                    key,
                    guestId,
                    name: checkIn.name,
                    status: "checked-in",
                    message: `Checked in ${guestName}`,
                    timestamp: checkIn.arrivalTime ?? new Date().toISOString(),
                });
                showToast(`Checked in ${guestName}!`);
            }
        } catch (e) {
            const message = String(e);
            setLastScanResult({
                status: "error",
                title: "Check-in Error",
                subtitle: message,
            });
            logScan({ key, guestId, status: "error", message, timestamp: new Date().toISOString() });
            showToast("Failed to process scan.", "error");
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        setEventId(Number(value));
        setLastScanResult(null);
    };

    const handleClearHistory = () => {
        if (window.confirm("Clear scan history for this session?")) {
            setScanned([]);
            scannedKeysRef.current.clear();
            setLastScanResult(null);
            localStorage.removeItem(STORAGE_KEY);
            showToast("Scan history cleared.");
        }
    };

    useEffect(() => {
        if (eventId === -1) return;

        const scanner = new Html5Qrcode("reader");
        const startPromise = scanner
            .start(
                { facingMode: "environment" },
                {
                    fps: 24,
                    qrbox: {
                        width: 600,
                        height: 600,
                    },
                },
                (decodedText) => {
                    if (decodedText === lastScannedRef.current) return;
                    lastScannedRef.current = decodedText;
                    setTimeout(() => {
                        lastScannedRef.current = null;
                    }, 2500);

                    handleScan(decodedText);
                },
                () => {}
            )
            .catch(console.error);

        return () => {
            startPromise.finally(() => {
                const state = scanner.getState();
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                    scanner.stop().catch(() => {}).finally(() => scanner.clear());
                } else {
                    scanner.clear();
                }
            });
        };
    }, [eventId]);

    const selectedEvent = scannableEvents.find((e) => e.id === eventId);
    const guestList = selectedEvent?.guests || {};

    const filteredManualGuests = Object.entries(guestList).filter(([, guest]: [string, any]) => {
        if (!manualSearch.trim()) return false;
        const term = manualSearch.toLowerCase();
        return (
            (guest.name && guest.name.toLowerCase().includes(term)) ||
            (guest.email && guest.email.toLowerCase().includes(term))
        );
    });

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Door QR Scanner</h1>
                    <p className="mt-1 text-sm text-neutral-500">Scan guest QR codes for instant door check-in.</p>
                </div>
                <Select className="max-w-xs" onChange={handleChange} defaultValue="">
                    <option value="" disabled>
                        Select an event to scan
                    </option>
                    {scannableEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.title} ({formatDateRange(event)})
                        </option>
                    ))}
                </Select>
            </div>

            {eventId === -1 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-0 p-12 text-center shadow-card">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-neutral-800">Select an Event to Begin Scanning</h2>
                    <p className="mt-1.5 max-w-sm text-sm text-neutral-500">
                        Choose an event from the dropdown above to activate your camera and scan attendee QR codes.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Scanner Feed Container */}
                    <div className="flex flex-col gap-4 lg:col-span-7">
                        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-modal">
                            <div id="reader" className="w-full overflow-hidden" />
                        </div>

                        {/* Scan Result Banner */}
                        {lastScanResult && (
                            <div
                                className={`rounded-2xl border p-5 shadow-card transition-all animate-in zoom-in-95 ${
                                    lastScanResult.status === "checked-in"
                                        ? "border-brand-300 bg-brand-50 text-brand-950"
                                        : lastScanResult.status === "duplicate"
                                        ? "border-amber-300 bg-amber-50 text-amber-950"
                                        : "border-red-300 bg-red-50 text-red-950"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        {lastScanResult.status === "checked-in" && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {lastScanResult.status === "duplicate" && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                            </div>
                                        )}
                                        {lastScanResult.status === "error" && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold">{lastScanResult.title}</h3>
                                        {lastScanResult.subtitle && (
                                            <p className="mt-0.5 text-xs opacity-85">{lastScanResult.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Search Check-In Fallback */}
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                            <h2 className="text-sm font-bold text-neutral-800">Manual Check-In Lookup</h2>
                            <p className="text-xs text-neutral-500">Camera not scanning? Search guest by name or email.</p>
                            <div className="mt-3">
                                <Input
                                    type="text"
                                    placeholder="Type attendee name or email..."
                                    value={manualSearch}
                                    onChange={(e) => setManualSearch(e.target.value)}
                                />
                            </div>

                            {filteredManualGuests.length > 0 && (
                                <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-neutral-50">
                                    {filteredManualGuests.map(([id, guest]: [string, any]) => (
                                        <li key={id} className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900">{guest.name}</p>
                                                <p className="text-xs text-neutral-500">{guest.email || "No email"}</p>
                                            </div>
                                            <Button
                                                variant={guest.arrived ? "secondary" : "primary"}
                                                size="sm"
                                                onClick={() => handleScan(`${eventId}:${id}`)}
                                            >
                                                {guest.arrived ? "Re-scan" : "Check In"}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Scan History Log */}
                    <div className="flex flex-col gap-3 lg:col-span-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-neutral-900">
                                Session Scans ({scanned.length})
                            </h2>
                            {scanned.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearHistory}
                                    className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors"
                                >
                                    Clear History
                                </button>
                            )}
                        </div>

                        {scanned.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-0 p-8 text-center text-neutral-400 shadow-soft">
                                <p className="text-sm font-medium">No scans yet this session.</p>
                                <p className="mt-1 text-xs text-neutral-400">Position QR codes within the camera frame.</p>
                            </div>
                        ) : (
                            <ul className="flex max-h-125 flex-col divide-y divide-neutral-100 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-0 shadow-card">
                                {scanned
                                    .slice()
                                    .reverse()
                                    .map((entry, index) => (
                                        <li key={`${entry.key}-${index}`} className="flex items-center justify-between gap-3 p-3.5 hover:bg-neutral-50/50 transition-colors">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate font-semibold text-sm text-neutral-900">
                                                    {entry.name || `Guest #${entry.guestId}`}
                                                </span>
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                                                    entry.status === "checked-in"
                                                        ? "bg-brand-50 text-brand-700"
                                                        : entry.status === "duplicate"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                            >
                                                {STATUS_LABELS[entry.status]}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}