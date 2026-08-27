import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getGuestRsvp, submitRsvp } from "../../server/events";
import { Button } from "~/components/Button";
import { decryptId } from "~/utils/idCrypto";

type RsvpGuest = { name: string; rsvp: "Pending" | "Going" | "Declined"; rsvpAt: string | null };
type RsvpEvent = { title?: string; date?: string; location?: string };

export default function RsvpResponse() {
    const { eventId: rawEventId, guestId: rawGuestId } = useParams();
    const eventId = decryptId(rawEventId);
    const guestId = decryptId(rawGuestId);
    const [guest, setGuest] = useState<RsvpGuest | null>(null);
    const [event, setEvent] = useState<RsvpEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [submitting, setSubmitting] = useState<"Going" | "Declined" | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!eventId || !guestId) return;
        (async () => {
            const payload = await getGuestRsvp(eventId, guestId);
            if (payload.ok && payload.guest) {
                setGuest(payload.guest);
                setEvent(payload.event ?? null);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        })();
    }, [eventId, guestId]);

    async function handleRespond(response: "Going" | "Declined") {
        if (!eventId || !guestId) return;
        setSubmitting(response);
        const payload = await submitRsvp(eventId, guestId, response);
        if (payload.ok && payload.guest) {
            setGuest({ name: guest?.name ?? "", rsvp: payload.guest.rsvp, rsvpAt: payload.guest.rsvpAt });
        }
        setSubmitting(null);
        setSubmitted(true);
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
                    <p className="text-sm font-medium text-neutral-500">Loading your RSVP invitation...</p>
                </div>
            </div>
        );
    }

    if (notFound || !guest) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-neutral-800">Invitation Not Found</h2>
                <p className="mt-2 text-sm text-neutral-500">
                    This RSVP link is invalid or the event may have concluded. Please check with your event organizer.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-12 sm:px-6">
            <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-0 p-6 sm:p-8 shadow-card">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
                        RSVP Invitation
                    </span>
                    <h1 className="text-2xl font-extrabold capitalize text-neutral-900 sm:text-3xl">
                        {event?.title || "Special Event"}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600">
                        {event?.date && (
                            <div className="flex items-center gap-1.5 font-medium">
                                <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <rect width="18" height="18" x="3" y="4" rx="2" />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                                {event.date}
                            </div>
                        )}
                        {event?.location && (
                            <div className="flex items-center gap-1.5 font-medium capitalize">
                                <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {event.location}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-neutral-100 pt-6">
                    {submitted ? (
                        <div className="flex flex-col items-center text-center animate-in zoom-in-95">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">Thank you, {guest.name}!</h3>
                            <p className="mt-2 text-sm text-neutral-600">
                                Your response has been recorded as{" "}
                                <span className={`font-bold ${guest.rsvp === "Going" ? "text-brand-600" : "text-red-600"}`}>
                                    {guest.rsvp}
                                </span>
                                .
                            </p>
                            <button
                                type="button"
                                onClick={() => setSubmitted(false)}
                                className="mt-4 text-xs font-semibold text-neutral-500 hover:text-brand-600 underline"
                            >
                                Change your response
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="text-center">
                                <p className="text-base font-medium text-neutral-800">
                                    Hi <span className="font-bold">{guest.name}</span>, will you be attending?
                                </p>
                                {guest.rsvp !== "Pending" && (
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Current status: <span className="font-semibold text-neutral-700">{guest.rsvp}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                <Button
                                    variant={guest.rsvp === "Going" ? "primary" : "secondary"}
                                    onClick={() => handleRespond("Going")}
                                    disabled={submitting !== null}
                                    className="flex-1 py-3"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    {submitting === "Going" ? "Saving..." : "Yes, I'm Going"}
                                </Button>
                                <Button
                                    variant={guest.rsvp === "Declined" ? "danger" : "secondary"}
                                    onClick={() => handleRespond("Declined")}
                                    disabled={submitting !== null}
                                    className="flex-1 py-3"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {submitting === "Declined" ? "Saving..." : "Can't Make It"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
