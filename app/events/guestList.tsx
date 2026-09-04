import { useOutletContext, useParams } from "react-router";
import { useRef, useState, useEffect } from "react";
import { read as readXlsx, utils as xlsxUtils, write as writeXlsx } from "xlsx";
import { events, checkInGuest, addGuest, resendEmail } from "../../server/events";
import InviteForm from "./inviteFloat";
import { PageHeader } from "~/components/PageHeader";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { StatTile } from "~/components/StatTile";
import { EditIcon } from "~/components/EditIcon";
import { IconButton } from "~/components/IconButton";
import EditGuestFloat from "./editGuestFloat";
import { decryptId, encryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";
import { Select } from "~/components/Select";
// import {sendGuestInviteEmail} from "../../src/services/mailer";

type FilterType = "all" | "arrived" | "notArrived" | "Going" | "Declined" | "Pending";

export default function GuestList() {
    const { event } = useOutletContext<{ event: any }>();
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const { showToast } = useToast();

    const [curEvent, setCurEvent] = useState(events.find((e) => String(e.id) === eventId));
    useEffect(() => {
        setCurEvent(events.find((e) => String(e.id) === eventId));
    });

    const guestList = curEvent?.guests || {};
    const guestEntries = Object.entries(guestList);
    const guestValues = Object.values(guestList) as any[];

    const arrivedCount = guestValues.filter((g) => g.arrived).length;
    const notArrivedCount = guestValues.length - arrivedCount;
    const arrivalPercentage = guestValues.length > 0 ? Math.round((arrivedCount / guestValues.length) * 100) : 0;

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importError, setImportError] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isEditGuestOpen, setIsEditGuestOpen] = useState(false);
    const [editGuestId, setEditGuestId] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    

    async function handleCheckInToggle(targetEventId: string, guestId: string) {
        if (!targetEventId) return;
        const currentGuest = guestList[guestId];
        const willBeArrived = !currentGuest?.arrived;

        try {
            await checkInGuest(targetEventId, guestId);
            setCurEvent((prev) => {
                if (!prev || !prev.guests) return prev;
                return {
                    ...prev,
                    guests: {
                        ...prev.guests,
                        [guestId]: {
                            ...prev.guests[guestId],
                            arrived: willBeArrived,
                            status: willBeArrived ? "Arrived" : "Not arrived",
                            arrivalTime: willBeArrived ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                        },
                    },
                };
            });
            showToast(
                willBeArrived ? `${currentGuest?.name || "Guest"} checked in!` : `Check-in reverted for ${currentGuest?.name || "Guest"}`
            );
        } catch {
            showToast("Failed to update check-in status.", "error");
        }
    }

    async function handleInviteSubmit(guest: { name: string; email: string; number: string; remarks: string }) {
        if (!eventId) return;
        try {
            await addGuest(eventId, guest);
            setCurEvent(events.find((e) => String(e.id) === eventId));
            showToast(`Invitation sent to ${guest.name}!`);
        } catch {
            showToast("Failed to invite guest.", "error");
        }
    }

    function parseCsv(text: string): string[][] {
        const rows: string[][] = [];
        let row: string[] = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (inQuotes) {
                if (char === '"') {
                    if (text[i + 1] === '"') {
                        field += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += char;
                }
            } else if (char === '"') {
                inQuotes = true;
            } else if (char === ",") {
                row.push(field);
                field = "";
            } else if (char === "\n" || char === "\r") {
                if (char === "\r" && text[i + 1] === "\n") i++;
                row.push(field);
                rows.push(row);
                row = [];
                field = "";
            } else {
                field += char;
            }
        }
        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }
        return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
    }

    function parseXlsx(buffer: ArrayBuffer): string[][] {
        const workbook = readXlsx(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsxUtils.sheet_to_json<string[]>(firstSheet, { header: 1, raw: false, defval: "" });
        return rows
            .map((row) => row.map((cell) => String(cell ?? "")))
            .filter((row) => row.some((cell) => cell.trim() !== ""));
    }

    function handleImportClick() {
        fileInputRef.current?.click();
    }

    function handleOpenEditGuest(guestId: string) {
        setEditGuestId(guestId);
        setIsEditGuestOpen(true);
    }

    async function handleCopyLink(guestId: string, guestName: string) {
        if (!eventId) return;
        const link = `${window.location.origin}/rsvp/${encryptId(eventId)}/${encryptId(guestId)}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(guestId);
            showToast(`RSVP link for ${guestName} copied!`);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            showToast("Failed to copy RSVP link.", "error");
        }
    }
    
    async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !eventId) return;

        setImportError(false);
        setImportStatus(null);

        try {
            const isXlsx =
                file.name.toLowerCase().endsWith(".xlsx") ||
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            const rows = isXlsx ? parseXlsx(await file.arrayBuffer()) : parseCsv(await file.text());

            if (rows.length === 0) {
                throw new Error(isXlsx ? "The XLSX file is empty." : "The CSV file is empty.");
            }

            const header = rows[0].map((cell) => cell.trim().toLowerCase());
            const nameIndex = header.indexOf("name");
            const emailIndex = header.indexOf("email");
            const numberIndex = header.findIndex((h) => ["number", "phone", "phone number", "contact", "tel"].includes(h));
            const remarksIndex = header.findIndex((h) => ["remarks", "remark", "notes", "note", "comment", "comments"].includes(h));

            if (nameIndex === -1 || emailIndex === -1) {
                throw new Error(`${isXlsx ? "XLSX" : "CSV"} must include a "name" and an "email" column.`);
            }

            const guestsToImport = rows
                .slice(1)
                .map((row) => ({
                    name: (row[nameIndex] ?? "").trim(),
                    email: (row[emailIndex] ?? "").trim(),
                    number: numberIndex !== -1 ? (row[numberIndex] ?? "").trim() : "",
                    remarks: remarksIndex !== -1 ? (row[remarksIndex] ?? "").trim() : "",
                }))
                .filter((g) => g.name);

            if (guestsToImport.length === 0) {
                throw new Error(`No valid guest rows found in the ${isXlsx ? "XLSX" : "CSV"}.`);
            }

            setIsImporting(true);
            for (const guest of guestsToImport) {
                await addGuest(eventId, guest);
            }

            setCurEvent(events.find((ev) => String(ev.id) === eventId));
            showToast(`Successfully imported ${guestsToImport.length} guests!`);
        } catch (err) {
            setImportError(true);
            setImportStatus(err instanceof Error ? err.message : "Failed to import file.");
            showToast("Failed to import guests.", "error");
        } finally {
            setIsImporting(false);
        }
    }

    // Filter and search
    const visibleGuests = guestEntries.filter(([, guest]: [string, any]) => {
        const term = search.toLowerCase();
        const matchesSearch =
            (guest.name && guest.name.toLowerCase().includes(term)) ||
            (guest.email && guest.email.toLowerCase().includes(term)) ||
            (guest.number && guest.number.includes(term)) ||
            (guest.remarks && guest.remarks.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        if (filter === "arrived") return Boolean(guest.arrived);
        if (filter === "notArrived") return !Boolean(guest.arrived);
        if (filter === "Going" || filter === "Declined" || filter === "Pending") {
            return (guest.rsvp ?? "Pending") === filter;
        }

        return true;
    });

    function escapeCsvValue(value: string) {
        const needsQuotes = /[",\n]/.test(value);
        const escaped = value.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    }

    function getGuestExportData() {
        const header = ["#", "Name", "Email", "Phone", "Remarks", "Arrival Time", "Status", "RSVP", "Creation Time"];
        const rows = visibleGuests.map(([, guest]: [string, any], index) => [
            String(index + 1),
            guest.name ?? "",
            guest.email ?? "",
            guest.number ?? "",
            guest.remarks ?? "",
            guest.arrivalTime ?? "",
            guest.status ?? "",
            guest.rsvp ?? "Pending",
            guest.createdAt ? (isNaN(new Date(guest.createdAt).getTime()) ? guest.createdAt : new Date(guest.createdAt).toLocaleString()) : "",
        ]);
        return { header, rows };
    }

    function handleExportCsv() {
        const { header, rows } = getGuestExportData();
        const csv = [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const fileName = `${(curEvent?.title || "guestlist").trim().replace(/\s+/g, "-").toLowerCase()}-guests.csv`;

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Guestlist exported to CSV!");
    }

    function handleExportExcel() {
        const { header, rows } = getGuestExportData();
        const worksheet = xlsxUtils.aoa_to_sheet([header, ...rows]);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, "Guests");

        const excelBuffer = writeXlsx(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const fileName = `${(curEvent?.title || "guestlist").trim().replace(/\s+/g, "-").toLowerCase()}-guests.xlsx`;

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Guestlist exported to Excel!");
    }

    if (!curEvent) return null;

    const totalItems = visibleGuests.length;
    const [numOfItems, setNumOfItems] = useState(20);
    const [curPage, setCurPage] = useState(1);
    const maxPages = Math.ceil(totalItems / numOfItems) 
    const handleChangePage = (direction: number) =>{
        const prevPage = curPage
        
        if(prevPage + direction < 0 || prevPage + direction > maxPages){
            return;
        }
        else{
            setCurPage(prevPage + direction)
            console.log(curPage)
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.target;
        setNumOfItems(Number(value));
        setCurPage(1);
    };

    async function handelResendInvite(newGuestId: string) {
        try{
                resendEmail(
                    eventId,
                    newGuestId
            )
            }
            catch (e){
                console.log(e)
            }
    }


    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-12 pt-6 sm:px-8">
            <PageHeader
                title="Guestlist"
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .csv, text/csv"
                            onChange={handleImportFile}
                            className="hidden"
                        />
                        <Button variant="secondary" size="sm" onClick={handleImportClick} disabled={isImporting}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M12 21V9m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>
                            {isImporting ? "Importing..." : "Import File"}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={visibleGuests.length === 0}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>
                            Export CSV
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExportExcel} disabled={visibleGuests.length === 0}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>
                            Export Excel
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Invite Guest
                        </Button>
                    </div>
                }
                className="mb-6"
                />

            {importStatus && (
                <div
                    className={`mb-4 rounded-xl border p-3 text-sm ${
                        importError ? "border-red-200 bg-red-50 text-red-700" : "border-brand-200 bg-brand-50 text-brand-700"
                    }`}
                >
                    {importStatus}
                </div>
            )}


            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                <button
                    type="button"
                    onClick={() => setFilter(filter === "arrived" ? "all" : "arrived")}
                    className={`text-left transition-all ${filter === "arrived" ? "ring-2 ring-brand-500 rounded-xl" : ""}`}
                >
                    <StatTile label="Arrived" value={arrivedCount} tone="brand" />
                </button>
                <button
                    type="button"
                    onClick={() => setFilter(filter === "notArrived" ? "all" : "notArrived")}
                    className={`text-left transition-all ${filter === "notArrived" ? "ring-2 ring-accent-500 rounded-xl" : ""}`}
                >
                    <StatTile label="Not Arrived" value={notArrivedCount} tone="accent" />
                </button>
                <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`text-left transition-all ${filter === "all" ? "ring-2 ring-neutral-400 rounded-xl" : ""}`}
                >
                    <StatTile label="Total Guests" value={guestValues.length} tone="neutral" />
                </button>
            </div>

            {/* Arrival Progress Bar */}
            {guestValues.length > 0 && (
                <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-0 p-4 shadow-soft">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-neutral-700">Check-in Progress</span>
                        <span className="font-bold text-brand-600">
                            {arrivedCount} / {guestValues.length} ({arrivalPercentage}%)
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                            className="h-full bg-brand-500 transition-all duration-500 rounded-full"
                            style={{ width: `${arrivalPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                    {(
                        [
                            { id: "all", label: "All" },
                            { id: "arrived", label: "Arrived" },
                            { id: "notArrived", label: "Not Arrived" },
                            { id: "Going", label: "RSVP Going" },
                            { id: "Declined", label: "Declined" },
                            { id: "Pending", label: "Pending" },
                        ] as { id: FilterType; label: string }[]
                    ).map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className={`rounded-pill px-3 py-1 text-xs font-semibold transition-all ${
                                filter === f.id
                                    ? "bg-brand-500 text-white shadow-xs"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:max-w-xs">
                    <Input
                        type="text"
                        placeholder="Search by name, email, phone, remarks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                    <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>
            
            <div className="flex flex-row justify-between items-center">
                <span className="ml-11"></span>
                <span className="text-right mr-6">Show:</span>
            </div>
            <div className ="flex flex-row justify-between items-center mb-2">
                <div className="items-center flex flex-row gap-7">
                    <button onClick={() => handleChangePage(-1)} disabled={curPage === 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8899a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="arcs"><path d="M15 18l-6-6 6-6"></path></svg>
                    </button>
                    <span className="mt-1">Page {curPage} of {maxPages}</span>
                    <button onClick={() => handleChangePage(1)} disabled={curPage === maxPages}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8899a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="arcs"><path d="M9 18l6-6-6-6"></path></svg>
                    </button>
                </div>

                <div>
                    <Select className="max-w-25" onChange={handleChange} defaultValue="">
                    <option value="20">
                        20
                    </option>
                    <option value="40">
                        40
                    </option>
                    <option value="80">
                        80
                    </option>
                    <option value="100">
                        100
                    </option>
                </Select>
                </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-212.5 text-left text-sm">
                        <thead className="bg-brand-500 text-xs font-semibold uppercase tracking-wider text-white">
                            <tr>
                                <th className="py-3.5 pl-4 pr-2 w-10">#</th>
                                <th className="py-3.5 px-3">Guest</th>
                                <th className="py-3.5 px-3">Contact</th>
                                <th className="py-3.5 px-3">Remarks</th>
                                <th className="py-3.5 px-3">RSVP</th>
                                <th className="py-3.5 px-3">Status</th>
                                <th className="py-3.5 px-3 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {visibleGuests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                                        No guests found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                visibleGuests.slice((curPage*numOfItems)-numOfItems,curPage*numOfItems).map(([id, guest]: [string, any], index) => {
                                    const isArrived = Boolean(guest.arrived);
                                    return (
                                        <tr key={id} className="transition-colors hover:bg-neutral-50/80">
                                            <td className="py-3 pl-4 pr-2 text-neutral-400 text-xs font-mono">{index + 1 + (curPage*numOfItems)-numOfItems}</td>
                                            <td className="py-3 px-3">
                                                <div className="font-semibold text-neutral-900">{guest.name}</div>
                                            </td>
                                            <td className="py-3 px-3 text-neutral-600">
                                                <div>{guest.email || "—"}</div>
                                                {guest.number && <div className="text-xs text-neutral-400">{guest.number}</div>}
                                            </td>
                                            <td className="py-3 px-3 text-neutral-600">
                                                {guest.remarks ? (
                                                    <span className="inline-block max-w-xs truncate text-xs text-neutral-700 font-normal" title={guest.remarks}>
                                                        {guest.remarks}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-neutral-300">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span
                                                    className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                                                        guest.rsvp === "Going"
                                                            ? "bg-brand-50 text-brand-700"
                                                            : guest.rsvp === "Declined"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-neutral-100 text-neutral-600"
                                                    }`}
                                                >
                                                    {guest.rsvp ?? "Pending"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                {isArrived ? (
                                                    <div className="flex items-center gap-1.5 text-brand-600 font-semibold text-xs">
                                                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                                                        Arrived {guest.arrivalTime ? `(${guest.arrivalTime})` : ""}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                                                        <span className="h-2 w-2 rounded-full bg-neutral-300" />
                                                        Not arrived
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right pr-4">
                                                <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                                                    <Button
                                                        onClick={() => handelResendInvite(id)}
                                                        size="sm"
                                                        className="text-xs bg-brand-50 text-brand-700"
                                                    >
                                                        {"Resend Email"}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleCopyLink(id, guest.name)}
                                                        variant="secondary"
                                                        size="sm"
                                                        className={`min-w-25.5 justify-center transition-all ${
                                                            copiedId === id ? "bg-brand-50 text-brand-700 font-semibold" : ""
                                                        }`}
                                                    >
                                                        {copiedId === id ? (
                                                            <>
                                                                <svg className="h-3.5 w-3.5 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="h-3.5 w-3.5 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                                </svg>
                                                                <span>RSVP Link</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleCheckInToggle(String(eventId), id)}
                                                        variant={isArrived ? "secondary" : "primary"}
                                                        size="sm"
                                                        className={`min-w-20 justify-center ${isArrived ? "text-neutral-600 hover:text-neutral-900" : ""}`}
                                                    >
                                                        {isArrived ? "Undo" : "Check In"}
                                                    </Button>
                                                    <IconButton
                                                        size="sm"
                                                        onClick={() => handleOpenEditGuest(id)}
                                                        className="text-neutral-400 hover:text-neutral-700"
                                                        aria-label={`Edit ${guest.name}`}
                                                    >
                                                        <EditIcon size={18} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card List View */}
            <div className="flex flex-col gap-3 sm:hidden">
                {visibleGuests.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-8 text-center text-neutral-400">
                        No guests found.
                    </div>
                ) : (
                    visibleGuests.slice((curPage*numOfItems)-numOfItems,curPage*numOfItems).map(([id, guest]: [string, any]) => {
                        const isArrived = Boolean(guest.arrived);
                        return (
                            <div
                                key={id}
                                className={`rounded-xl border p-4 shadow-soft transition-all ${
                                    isArrived ? "border-brand-200 bg-brand-50/30" : "border-neutral-200 bg-neutral-0"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{guest.name}</h3>
                                        <p className="text-xs text-neutral-500">{guest.email || "No email"}</p>
                                        {guest.number && <p className="text-xs text-neutral-400 mt-0.5">{guest.number}</p>}
                                    </div>
                                    <span
                                        className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                                            guest.rsvp === "Going"
                                                ? "bg-brand-100 text-brand-800"
                                                : guest.rsvp === "Declined"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-neutral-100 text-neutral-600"
                                        }`}
                                    >
                                        {guest.rsvp ?? "Pending"}
                                    </span>
                                </div>

                                {guest.remarks && (
                                    <div className="mt-2.5 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                                        <span className="font-semibold text-neutral-500">Remarks: </span>
                                        <span className="italic">{guest.remarks}</span>
                                    </div>
                                )}

                                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                                    <span className="text-xs text-neutral-500">
                                        {isArrived ? `Arrived at ${guest.arrivalTime || "event"}` : "Not arrived yet"}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            onClick={() => handelResendInvite(id)}
                                            size="sm"
                                            className="text-xs text-brand-600 hover:text-brand-800"
                                        >
                                            {"Email"}
                                        </Button>
                                        <Button
                                            onClick={() => handleCopyLink(id, guest.name)}
                                            variant="secondary"
                                            size="sm"
                                            className={`text-xs px-2.5 py-1 ${
                                                copiedId === id ? "bg-brand-50 text-brand-700 font-semibold" : ""
                                            }`}
                                        >
                                            {copiedId === id ? (
                                                <>
                                                    <svg className="h-3 w-3 text-brand-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-3 w-3 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                    </svg>
                                                    <span>RSVP</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleCheckInToggle(String(eventId), id)}
                                            variant={isArrived ? "secondary" : "primary"}
                                            size="sm"
                                            className="text-xs px-2.5 py-1"
                                        >
                                            {isArrived ? "Undo" : "Check In"}
                                        </Button>
                                        <IconButton
                                            size="sm"
                                            onClick={() => handleOpenEditGuest(id)}
                                            className="text-neutral-400 hover:text-neutral-700"
                                            aria-label="Edit guest"
                                        >
                                            <EditIcon size={18} />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="">
                <div className="items-center flex flex-row gap-7 mt-4">
                    <button onClick={() => handleChangePage(-1)} disabled={curPage === 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8899a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="arcs"><path d="M15 18l-6-6 6-6"></path></svg>
                    </button>
                    <span className="mt-1">Page {curPage} of {maxPages}</span>
                    <button onClick={() => handleChangePage(1)} disabled={curPage === maxPages}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8899a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="arcs"><path d="M9 18l6-6-6-6"></path></svg>
                    </button>
                </div>
            </div>
            <InviteForm isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onSubmit={handleInviteSubmit} />

            <EditGuestFloat
                isOpen={isEditGuestOpen}
                onClose={() => {
                    setIsEditGuestOpen(false);
                    setCurEvent(events.find((e) => String(e.id) === eventId));
                }}
                event={curEvent}
                guestId={editGuestId}
            />
        </main>
    );
}