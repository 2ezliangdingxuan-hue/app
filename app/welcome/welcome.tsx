import Banner from "./banner.png";
import { getEvents } from "../../src/data/events";
import { useEffect, useState } from "react";
import { Card } from "~/components/Card";
import { PageHeader } from "~/components/PageHeader";

export function Welcome() {

  interface Guest{
    name: string; arrived: boolean
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
  useEffect(() =>{
    async function loadEvents(){
      const res = await getEvents();
      const data = await res.json();
      setEvents(data);
    }
    loadEvents();
  },[])

  return (
    <main className="flex w-full flex-col items-center pb-16">
      <div className="w-full">
        <img src={Banner} alt="Banner" className="aspect-2/1 w-full object-cover sm:aspect-3/1" />
      </div>
      <div className="flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-8">
        <PageHeader title="Upcoming Events" className="pt-4" />
        {events.length === 0 ? (
          <p className="py-8 text-neutral-500">No events yet. Check back soon.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <li key={event.id}>
                <Card
                  href={`/view/${event.id}`}
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
  );
}
