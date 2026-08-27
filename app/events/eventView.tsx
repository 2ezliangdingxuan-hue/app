import { useState } from "react";
import { useParams, Link } from "react-router";
import { events, addGuest } from "../../server/events";
import { Button } from "~/components/Button";
import SignUpForm from "./signUpFloat";
import { decryptId, encryptId } from "~/utils/idCrypto";
import { useToast } from "~/components/Toast";

export default function EventView() {
    const { eventId: rawEventId } = useParams();
    const eventId = decryptId(rawEventId);
    const curEvent = events.find((event) => String(event.id) === eventId);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const { showToast } = useToast();

    if (!curEvent) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
                <h2 className="text-xl font-bold text-neutral-800">Event Not Found</h2>
                <p className="mt-2 text-sm text-neutral-500">The event you are looking for does not exist.</p>
                <Link to="/" className="mt-4 text-sm font-semibold text-brand-600 hover:underline">
                    Back to Home
                </Link>
            </div>
        );
    }

    const guestCount = curEvent.guests ? Object.keys(curEvent.guests).length : 0;
    const maxCapacity = Number(curEvent.maxGuests) || 0;
    const capacityPercent = maxCapacity > 0 ? Math.min(100, Math.round((guestCount / maxCapacity) * 100)) : 0;
    const spotsLeft = maxCapacity > 0 ? Math.max(0, maxCapacity - guestCount) : null;

    const handleSignUp = async (guest: { name: string; email: string; number: string; remarks: string }) => {
        try {
            await addGuest(String(curEvent.id), { ...guest, selfSignup: true });
            showToast(`Registered ${guest.name} for ${curEvent.title}!`);
        } catch (err) {
            showToast("Failed to complete sign-up.", "error");
            throw err;
        }
    };

    // Google Calendar URL generator
    const googleCalendarUrl = () => {
        const title = encodeURIComponent(curEvent.title || "Event");
        const details = encodeURIComponent(curEvent.description || "");
        const location = encodeURIComponent(curEvent.location || "");
        let dateStr = "";
        if (curEvent.date) {
            const parsed = new Date(curEvent.date);
            if (!isNaN(parsed.getTime())) {
                const start = parsed.toISOString().replace(/-|:|\.\d\d\d/g, "");
                dateStr = `&dates=${start}/${start}`;
            }
        }
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dateStr}`;
    };

    const googleMapsUrl = curEvent.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(curEvent.location)}`
        : null;

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-8">
            {/* Header Title & Category */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                        {curEvent.category || "Event"}
                    </span>
                    <h1 className="mt-2 text-3xl font-extrabold capitalize tracking-tight text-neutral-900 sm:text-4xl">
                        {curEvent.title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="primary" size="lg" onClick={() => setIsSignUpOpen(true)}>
                        Register Now
                    </Button>
                </div>
            </div>

            <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} onSubmit={handleSignUp} />

            {/* Event Hero Image */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 shadow-card">
                <img className="aspect-2/1 w-full object-cover" src={curEvent.img} alt={curEvent.title} />
            </div>

            {/* Event Details Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Date & Time */}
                <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Date</span>
                        <p className="mt-1 text-lg font-bold text-neutral-900">{curEvent.date || "TBD"}</p>
                    </div>
                    <a
                        href={googleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="18" height="18" x="3" y="4" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        Add to Calendar
                    </a>
                </div>

                {/* Location */}
                <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Location</span>
                        <p className="mt-1 text-lg font-bold capitalize text-neutral-900 truncate">
                            {curEvent.location || "Online / TBD"}
                        </p>
                    </div>
                    {googleMapsUrl && (
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Open in Maps
                        </a>
                    )}
                </div>

                {/* Capacity & Spots */}
                <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-0 p-5 shadow-soft">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Capacity</span>
                        <p className="mt-1 text-lg font-bold text-neutral-900">
                            {maxCapacity > 0 ? `${maxCapacity} Guests` : "Open Capacity"}
                        </p>
                    </div>
                    {maxCapacity > 0 && (
                        <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs text-neutral-500">
                                <span>{spotsLeft} spots left</span>
                                <span className="font-semibold text-brand-600">{capacityPercent}% full</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                                <div
                                    className="h-full bg-brand-500 rounded-full transition-all"
                                    style={{ width: `${capacityPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 shadow-soft">
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-neutral-800">About this event</h2>
                </div>
                <div className="p-6">
                    {curEvent.description ? (
                        <p className="whitespace-pre-line text-base leading-7 text-neutral-600">
                            {curEvent.description}
                        </p>
                    ) : (
                        <p className="text-sm text-neutral-400">No additional description provided.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
