import { getEvents } from "../../src/data/events"
import { useEffect, useState } from "react"
import { Card } from "~/components/Card"
import { PageHeader } from "~/components/PageHeader"
import { LinkButton } from "~/components/Button"

export default function Events() {

    interface Guest{

    }
    interface Event{
    id: number;
    title: string;
    description: string;
    date: string;
    category: string;
    location?: string;
    img: string;
    guests?: Record<string, Guest>
    }

    const [events, setEvents] = useState<Event[]>([]);
    useEffect (() => {
        async function loadEvents(){
            const res = await getEvents();
            const data= await res.json();
            setEvents(data);
        }
        loadEvents();
    }, [])

    return(
        <main className="mx-auto flex w-full max-w-7xl flex-col p-4 sm:p-8">
            <PageHeader
                title="Events"
                action={
                    <LinkButton to="/createEvent" variant="primary">
                        Create Event +
                    </LinkButton>
                }
            />
            <div>
                {events.length === 0 ? (
                    <p className="py-8 text-neutral-500">No events yet. Create the first one.</p>
                ) : (
                    <ul className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
                    {events.map((event) => (
                        <li key={event.id}>
                            <Card
                                href={`/events/${event.id}`}
                                image={event.img}
                                title={event.title}
                                date={event.date}
                                location={event.location}
                            />
                        </li>
                    ))}
                    </ul>
                )}
            </div>

        </main>
    )
}