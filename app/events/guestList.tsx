import { useOutletContext, useParams } from "react-router";
import {useRef, useState, useEffect} from "react";
import { read as readXlsx, utils as xlsxUtils } from "xlsx";
import { events, checkInGuest, addGuest } from "../../server/events";
import InviteForm from "./inviteFloat";
import { PageHeader } from "~/components/PageHeader";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { StatTile } from "~/components/StatTile";
import { EditIcon } from "~/components/EditIcon";
import EditGuestFloat from "./editGuestFloat";

export default function GuestList() {
    const {event} = useOutletContext<{event: any }>();
    const{eventId} = useParams();
    const [curEvent,setCurEvent] = useState(events.find((event) => String(event.id) === eventId))
    useEffect(()=>{
        setCurEvent(events.find((event) => String(event.id) === eventId))
    })
    const guestList = curEvent?.guests;
    const guestValues = guestList ? Object.values(guestList) : [];
    const arrivedCount = guestValues.filter((guest) => guest.arrived).length;
    const notArrivedCount = guestValues.length - arrivedCount;
    //const [checkedInGuestIds, setCheckedInGuestIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusSort, setStatusSort] = useState<"none" | "arrived" | "notArrived">("none");
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [importError, setImportError] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const[isInviteOpen, setIsInviteOpen] = useState(false)
    const[isEditGuestOpen, setIsEditGuestOpen] = useState(false)
    const[editGuestId, setEditGuestId]=useState("")

    function cycleStatusSort(){
        setStatusSort((current) =>
            current === "none" ? "arrived" : current === "arrived" ? "notArrived" : "none"
        );
    }

    
    function checkIn(eventId: string, guestId: string){
        if (!eventId) return;
        const success = checkInGuest(eventId, guestId);
        console.log(success);
    }

    async function handleInviteSubmit(guest:{name:string; email:string}){
        if (!eventId) return;
        await addGuest(eventId, guest);
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

    function handleImportClick(){
        fileInputRef.current?.click();
    }

    function handleOpenEditGuest(guestId:string){
        setEditGuestId(guestId);
        setIsEditGuestOpen(true);
    }

    async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>){
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !eventId) return;

        setImportError(false);
        setImportStatus(null);

        try {
            const isXlsx = file.name.toLowerCase().endsWith(".xlsx")
                || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            const rows = isXlsx
                ? parseXlsx(await file.arrayBuffer())
                : parseCsv(await file.text());

            if (rows.length === 0){
                throw new Error(isXlsx ? "The XLSX file is empty." : "The CSV file is empty.");
            }

            const header = rows[0].map((cell) => cell.trim().toLowerCase());
            const nameIndex = header.indexOf("name");
            const emailIndex = header.indexOf("email");

            if (nameIndex === -1 || emailIndex === -1){
                throw new Error(`${isXlsx ? "XLSX" : "CSV"} must include a "name" and an "email" column.`);
            }

            const guestsToImport = rows
                .slice(1)
                .map((row) => ({
                    name: (row[nameIndex] ?? "").trim(),
                    email: (row[emailIndex] ?? "").trim(),
                }))
                .filter((guest) => guest.name);

            if (guestsToImport.length === 0){
                throw new Error(`No valid guest rows found in the ${isXlsx ? "XLSX" : "CSV"}.`);
            }

            setIsImporting(true);
            for (const guest of guestsToImport){
                await addGuest(eventId, guest);
            }

            setImportStatus(`Imported ${guestsToImport.length} guest${guestsToImport.length === 1 ? "" : "s"}.`);
        } catch (err) {
            setImportError(true);
            setImportStatus(err instanceof Error ? err.message : "Failed to import CSV.");
        } finally {
            setIsImporting(false);
        }
    }

    const visibleGuests = (guestList
        ? Object.entries(guestList).filter(([, guest]) =>
            guest.name.toLowerCase().includes(search.toLowerCase())
        )
        : []
    ).sort(([, a], [, b]) => {
        if (statusSort === "none") return 0;
        const diff = Number(Boolean(b.arrived)) - Number(Boolean(a.arrived));
        return statusSort === "arrived" ? diff : -diff;
    });

    function escapeCsvValue(value: string){
        const needsQuotes = /[",\n]/.test(value);
        const escaped = value.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    }

    function handleExportCsv(){
        const header = ["#", "Name", "Email", "Time", "Status", "RSVP"];
        const rows = visibleGuests.map(([, guest], index) => [
            String(index + 1),
            guest.name ?? "",
            guest.email ?? "",
            guest.arrivalTime ?? "",
            guest.status ?? "",
            guest.rsvp ?? "Pending",
        ]);
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
    }

    if(!curEvent){
        return;
    }
    return(
        <main className="flex w-full flex-col px-4 pb-4 pt-8 sm:px-6">

            <PageHeader
                title="Guestlist"
                action={
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .csv, text/csv"
                            onChange={handleImportFile}
                            className="hidden"
                        />
                        <Button
                            variant="secondary"
                            onClick={handleImportClick}
                            disabled={isImporting}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 21V9m0 0l-4 4m4-4l4 4" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>
                            {isImporting ? "Importing..." : "Import CSV/EXCEL"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleExportCsv}
                            disabled={visibleGuests.length === 0}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                            </svg>
                            Export CSV
                        </Button>
                        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
                            Invite guest +
                        </Button>
                    </div>
                }
                className="mb-6"
            />
            {importStatus && (
                <p className={`mb-4 text-sm ${importError ? "text-danger-500" : "text-success-500"}`}>
                    {importStatus}
                </p>
            )}
            <div className="mb-6 flex w-full flex-row justify-evenly gap-4">
                <StatTile label="Arrived" value={arrivedCount} tone="brand" />
                <StatTile label="Not Arrived" value={notArrivedCount} tone="accent" />
                <StatTile label="Total Guests" value={guestValues.length} tone="neutral" />
            </div>
            <InviteForm
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSubmit={handleInviteSubmit}
            />
            <EditGuestFloat
                isOpen = {isEditGuestOpen}
                onClose={()=>setIsEditGuestOpen(false)}
                event={curEvent}
                guestId={editGuestId}
            />
            <div className="mb-4 flex justify-end">
                <Input
                    type="text"
                    placeholder="Search guest"
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="overflow-hidden border border-neutral-200 shadow-card">
                <ul>
                    <li className="grid grid-cols-[40px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_90px_90px_90px_110px_90px] items-center gap-2 bg-brand-500 py-3 text-white">
                        <span className="pl-4">#</span>
                        <span>Guest</span>
                        <span>Email</span>
                        <span>Number</span>
                        <span>Remark</span>
                        <span className="">Time</span>
                        <span className="flex items-center text-center gap-1.5">
                            Status
                            <button
                                type="button"
                                onClick={cycleStatusSort}
                                title={
                                    statusSort === "none"
                                        ? "Sort by status"
                                        : statusSort === "arrived"
                                        ? "Arrived first"
                                        : "Not arrived first"
                                }
                                aria-label="Sort by status"
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white/20 ${
                                    statusSort !== "none" ? "text-white" : "text-white/60"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transition-transform ${statusSort === "notArrived" ? "rotate-180" : ""}`}
                                >
                                    <path d="M12 5v14M6 11l6-6 6 6" />
                                </svg>
                            </button>
                        </span>
                        <span className="text-center">RSVP</span>
                        <span className="text-center">Action</span>
                  
                    </li>

                    {visibleGuests.map(([id,guest], index) => (
                        <li key={id} className="grid grid-cols-[40px_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_90px_90px_90px_110px_90px]  items-center gap-2 border-b border-neutral-200 bg-neutral-0 py-2 last:border-b-0">
                            <span className="pl-4 text-sm text-neutral-400">{index + 1}</span>
                            <span className="truncate">{guest.name}</span>
                            <span className="truncate text-sm text-neutral-500">{guest.email || "-"}</span>
                            <span className="text-neutral-400">{guest.number || "-"}</span>
                            <span>{guest.remarks || "-"}</span>{/**======================================================== */}
                            <span className="text-sm  text-neutral-500">{guest.arrivalTime}</span>
                            <span className="text-sm font-medium text-neutral-600">{guest.status}</span>
                            <span
                                className={`text-sm font-medium ${
                                    guest.rsvp === "Going"
                                        ? "text-brand-600"
                                        : guest.rsvp === "Declined"
                                        ? "text-danger-500"
                                        : "text-neutral-500"
                                }`}
                            >
                                {guest.rsvp ?? "Pending"}
                            </span>
                            <span className="pr-4 text-right">
                                <Button
                                    onClick={() => checkIn(String(eventId),id)}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Check-In
                                </Button>
                            </span>
                            <span>
                                <Button
                                variant = "secondary"
                                size="sm"
                                onClick={() =>handleOpenEditGuest(id)}
                                className="w-11 h-11 items-center justify-center">
                                    <EditIcon/>
                                </Button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    )
}