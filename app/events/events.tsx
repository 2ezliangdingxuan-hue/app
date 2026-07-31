import {getEvents, getEventById} from "../../src/data/events"
import { useEffect, useState } from "react"



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
    })

    return(
        <main>
            <div className="p-8 flex flex-row justify-between">
                <h1 className="text-3xl font-bold">
                    Events
                </h1>
                <a href="/createEvent">
                <button className="border p-1 rounded-xl">
                    <p>
                        Create Event +
                    </p>
                </button>
                </a>
            </div>
            <div>
                <ul className="gap-4 flex flex-row py-6">
                {events.map((event) => (
                <a href={`/events/${event.id}`} key={event.id}>
                  <div className="border bg-white border-gray-200 rounded-lg p-4 drop-shadow-md" key={event.id}>
                    <li key={event.id} className="flex flex-col gap-2">
                      <img src={event.img} alt={event.title} />
                      <h2>{event.title}</h2>
                      <p>{event.date}</p>
                      <p>{event.location}</p>
                    </li>
                  </div>
                </a>
                ))}
                </ul>
            </div>

        </main>
    )
}