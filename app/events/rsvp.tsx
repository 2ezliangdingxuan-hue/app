import { useParams } from "react-router";
import { useState } from "react";
import { events } from "../../server/events";
import { PageHeader } from "~/components/PageHeader";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { StatTile } from "~/components/StatTile";
import { decryptId, encryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

type RsvpFilter = "All" | "Going" | "Declined" | "Pending";

export default function Rsvp() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const curEvent = events.find((event) => String(event.id) === eventId);
    const guestList = curEvent?.guests;
    const guestValues = guestList ? Object.values(guestList) : [];
    const { showToast } = useToast();

    const goingCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Going").length;
    const declinedCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Declined").length;
    const pendingCount = guestValues.filter((guest) => (guest.rsvp ?? "Pending") === "Pending").length;

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<RsvpFilter>("All");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const visibleGuests = guestList
        ? Object.entries(guestList).filter(([, guest]) => {
              const term = search.toLowerCase();
              const matchesSearch =
                  guest.name.toLowerCase().includes(term) ||
                  (guest.email && guest.email.toLowerCase().includes(term));
              const matchesFilter = filter === "All" || (guest.rsvp ?? "Pending") === filter;
              return matchesSearch && matchesFilter;
          })
        : [];

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

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-12 pt-6 sm:px-8">
            <PageHeader title="RSVP Responses" className="mb-6" />

            {/* Interactive Stat Tiles */}
            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                <button
                    type="button"
                    onClick={() => setFilter(filter === "Going" ? "All" : "Going")}
                    className={`text-left transition-all ${filter === "Going" ? "ring-2 ring-brand-500 rounded-xl" : ""}`}
                >
                    <StatTile label="Going" value={goingCount} tone="brand" />
                </button>
                <button
                    type="button"
                    onClick={() => setFilter(filter === "Declined" ? "All" : "Declined")}
                    className={`text-left transition-all ${filter === "Declined" ? "ring-2 ring-accent-500 rounded-xl" : ""}`}
                >
                    <StatTile label="Declined" value={declinedCount} tone="accent" />
                </button>
                <button
                    type="button"
                    onClick={() => setFilter(filter === "Pending" ? "All" : "Pending")}
                    className={`text-left transition-all ${filter === "Pending" ? "ring-2 ring-neutral-400 rounded-xl" : ""}`}
                >
                    <StatTile label="Pending" value={pendingCount} tone="neutral" />
                </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {(["All", "Going", "Declined", "Pending"] as RsvpFilter[]).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setFilter(option)}
                            className={`rounded-pill px-3.5 py-1 text-xs font-semibold transition-all ${
                                filter === option
                                    ? "bg-brand-500 text-white shadow-xs"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Input
                        type="text"
                        placeholder="Search guest or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                    <svg
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 shadow-card">
                <table className="w-full text-left text-sm">
                    <thead className="bg-brand-500 text-xs font-semibold uppercase tracking-wider text-white">
                        <tr>
                            <th className="py-3.5 pl-4 pr-2 w-10">#</th>
                            <th className="py-3.5 px-3">Guest</th>
                            <th className="py-3.5 px-3">Email</th>
                            <th className="py-3.5 px-3">Status</th>
                            <th className="py-3.5 px-3">Responded At</th>
                            <th className="py-3.5 px-3 text-right pr-4">Personal RSVP Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {visibleGuests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-neutral-400">
                                    No RSVP records found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            visibleGuests.map(([id, guest], index) => (
                                <tr key={id} className="transition-colors hover:bg-neutral-50/80">
                                    <td className="py-3 pl-4 pr-2 text-neutral-400 text-xs font-mono">{index + 1}</td>
                                    <td className="py-3 px-3 font-semibold text-neutral-900">{guest.name}</td>
                                    <td className="py-3 px-3 text-neutral-600">{guest.email || "—"}</td>
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
                                    <td className="py-3 px-3 text-xs text-neutral-500">
                                        {guest.rsvpAt ? new Date(guest.rsvpAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="py-3 px-3 text-right pr-4">
                                        <Button
                                            onClick={() => handleCopyLink(id, guest.name)}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                            </svg>
                                            {copiedId === id ? "Copied!" : "Copy RSVP Link"}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 sm:hidden">
                {visibleGuests.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-8 text-center text-neutral-400">
                        No RSVP records found.
                    </div>
                ) : (
                    visibleGuests.map(([id, guest]) => (
                        <div key={id} className="rounded-xl border border-neutral-200 bg-neutral-0 p-4 shadow-soft">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-neutral-900">{guest.name}</h3>
                                    <p className="text-xs text-neutral-500">{guest.email || "No email"}</p>
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
                            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                                <span className="text-xs text-neutral-400">
                                    {guest.rsvpAt ? `Responded: ${new Date(guest.rsvpAt).toLocaleDateString()}` : "No response yet"}
                                </span>
                                <Button onClick={() => handleCopyLink(id, guest.name)} variant="secondary" size="sm">
                                    {copiedId === id ? "Copied!" : "Copy Link"}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
