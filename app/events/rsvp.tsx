import { useParams } from "react-router";
import { useState } from "react";
import { events } from "../../server/events";
import { PageHeader } from "~/components/PageHeader";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { StatTile } from "~/components/StatTile";

type RsvpFilter = "All" | "Going" | "Declined" | "Pending";

export default function Rsvp() {
    const { eventId } = useParams();
    const curEvent = events.find((event) => String(event.id) === eventId);
    const guestList = curEvent?.guests;
    const guestValues = guestList ? Object.values(guestList) : [];

    const goingCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Going").length;
    const declinedCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Declined").length;
    const pendingCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Pending").length;

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<RsvpFilter>("All");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const visibleGuests = guestList
        ? Object.entries(guestList).filter(([, guest]) => {
              const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase());
              const matchesFilter = filter === "All" || (guest.rsvp ?? "Pending") === filter;
              return matchesSearch && matchesFilter;
          })
        : [];

    async function handleCopyLink(guestId: string) {
        if (!eventId) return;
        const link = `${window.location.origin}/rsvp/${eventId}/${guestId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(guestId);
            setTimeout(() => setCopiedId(null), 1500);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <main className="flex w-full flex-col px-4 pb-4 pt-8 sm:px-6">
            <PageHeader title="RSVPs" className="mb-6" />

            <div className="mb-6 flex w-full flex-row justify-evenly gap-4">
                <StatTile label="Going" value={goingCount} tone="brand" />
                <StatTile label="Declined" value={declinedCount} tone="accent" />
                <StatTile label="Pending" value={pendingCount} tone="neutral" />
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    {(["All", "Going", "Declined", "Pending"] as RsvpFilter[]).map((option) => (
                        <Button
                            key={option}
                            variant={filter === option ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setFilter(option)}
                        >
                            {option}
                        </Button>
                    ))}
                </div>
                <Input
                    type="text"
                    placeholder="Search guest"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="overflow-hidden border border-neutral-200 shadow-card">
                <ul>
                    <li className="grid grid-cols-[40px_minmax(140px,1fr)_minmax(140px,1fr)_100px_140px_110px] items-center gap-2 bg-brand-500 py-3 text-white">
                        <span className="pl-4">#</span>
                        <span>Guest</span>
                        <span>Email</span>
                        <span>RSVP</span>
                        <span>Responded At</span>
                        <span className="pr-4 text-right">Link</span>
                    </li>

                    {visibleGuests.map(([id, guest], index) => (
                        <li
                            key={id}
                            className="grid grid-cols-[40px_minmax(140px,1fr)_minmax(140px,1fr)_100px_140px_110px] items-center gap-2 border-b border-neutral-200 bg-neutral-0 py-2 last:border-b-0"
                        >
                            <span className="pl-4 text-sm text-neutral-400">{index + 1}</span>
                            <span className="truncate">{guest.name}</span>
                            <span className="truncate text-sm text-neutral-500">{guest.email || "—"}</span>
                            <span className="text-sm font-medium text-neutral-600">{guest.rsvp ?? "Pending"}</span>
                            <span className="text-sm text-neutral-500">
                                {guest.rsvpAt ? new Date(guest.rsvpAt).toLocaleString() : "—"}
                            </span>
                            <span className="pr-4 text-right">
                                <Button onClick={() => handleCopyLink(id)} variant="secondary" size="sm">
                                    {copiedId === id ? "Copied!" : "Copy Link"}
                                </Button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
