import { useOutletContext, useParams } from "react-router";
import {useState} from "react";
import { events, checkInGuest, addGuest } from "../../src/data/events";
import InviteForm from "./inviteFloat";
import { PageHeader } from "~/components/PageHeader";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";

export default function GuestList() {
    const {event} = useOutletContext<{event: any }>();
    const{eventId} = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);
    const guestList = curEvent?.guests;
    const [checkedInGuestIds, setCheckedInGuestIds] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [statusSort, setStatusSort] = useState<"none" | "arrived" | "notArrived">("none");

    const[isInviteOpen, setIsInviteOpen] = useState(false)

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

    return(
        <main className="flex w-full flex-col px-4 pb-4 pt-8 sm:px-6">

            <PageHeader
                title="Guestlist"
                action={
                    <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
                        Invite guest +
                    </Button>
                }
                className="mb-6"
            />
            <InviteForm
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSubmit={handleInviteSubmit}
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
            <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-card">
                <ul>
                    <li className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_90px_100px_110px] items-center gap-2 bg-brand-500 py-3 text-white">
                        <span className="pl-4">Guest</span>
                        <span>Email</span>
                        <span>Time</span>
                        <span className="flex items-center gap-1.5">
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
                        <span className="pr-4 text-right">Action</span>
                    </li>

                    {(guestList
                        ? Object.entries(guestList).filter(([, guest]) =>
                            guest.name.toLowerCase().includes(search.toLowerCase())
                        )
                        : []
                    )
                    .sort(([, a], [, b]) => {
                        if (statusSort === "none") return 0;
                        const diff = Number(Boolean(b.arrived)) - Number(Boolean(a.arrived));
                        return statusSort === "arrived" ? diff : -diff;
                    })
                    .map(([id,guest]) => (
                        <li key={id} className="grid grid-cols-[minmax(140px,1fr)_minmax(140px,1fr)_90px_100px_110px] items-center gap-2 border-b border-neutral-200 bg-neutral-0 py-2 last:border-b-0">
                            <span className="truncate pl-4">{guest.name}</span>
                            <span className="truncate text-sm text-neutral-500">{guest.email || "—"}</span>
                            <span className="text-sm text-neutral-500">{guest.arrivalTime}</span>
                            <span className="text-sm font-medium text-neutral-600">{guest.status}</span>
                            <span className="pr-4 text-right">
                                <Button
                                    onClick={() => checkIn(String(eventId),id)}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Check-In
                                </Button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    )
}