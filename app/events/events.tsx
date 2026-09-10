import { getEvents } from "../../server/events";
import { useEffect, useState } from "react";
import { Card } from "~/components/Card";
import { PageHeader } from "~/components/PageHeader";
import { LinkButton } from "~/components/Button";
import { CardSkeleton } from "~/components/Skeleton";
import { useAuth } from "~/auth/AuthContext";
import { encryptId } from "~/utils/idCrypto";
import { formatDateRange } from "~/utils/dateUtils";

interface Guest {}

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    startDate?: string;
    endDate?: string;
    category: string;
    location?: string;
    img: string;
    guests?: Record<string, Guest>;
    collaboratorIds?: number[];
}

export default function Events() {
    const { account } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await getEvents();
                const data = await res.json();
                const ownedIds = account?.eventIds || [];
                setEvents(
                    data.filter(
                        (event: Event) =>
                            ownedIds.includes(event.id) ||
                            (account && (event.collaboratorIds || []).includes(account.id))
                    )
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, [account]);

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col p-4 sm:p-8">
            <PageHeader
                title="Your Managed Events"
                action={
                    <LinkButton to="/createEvent" variant="primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Create New Event
                    </LinkButton>
                }
            />

            <div className="pt-4">
                {loading ? (
                    <div className="grid grid-cols-1 gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-0 p-12 text-center shadow-card my-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800">
                            {account ? "No Events Hosted Yet" : "Sign In to View Your Events"}
                        </h2>
                        <p className="mt-1.5 max-w-md text-sm text-neutral-500">
                            {account
                                ? "You haven't created or been added to any events yet. Get started by organizing your first event!"
                                : "Sign in with your host account to manage guestlists, RSVPs, and door check-ins."}
                        </p>
                        <div className="mt-6">
                            {account ? (
                                <LinkButton to="/createEvent" variant="primary">
                                    Create Your First Event
                                </LinkButton>
                            ) : (
                                <LinkButton to="/sign-in" variant="primary">
                                    Sign In to Account
                                </LinkButton>
                            )}
                        </div>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map((event) => (
                            <li key={event.id}>
                                <Card
                                    href={`/events/${encryptId(event.id)}`}
                                    image={event.img}
                                    title={event.title}
                                    date={formatDateRange(event)}
                                    location={event.location}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}