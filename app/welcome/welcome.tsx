import Banner from "./banner.png";
//import {events} from "../../src/events.json";
import {getEvents, events} from "../../src/data/events";
import {useEffect, useState} from "react";


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
    <main className="flex flex-col items-center justify-center pb-4 w-full">
      <div className="w-full">
        <img src={Banner} alt="Banner" className="w-full h-auto object-cover" />
      </div>
      <div className="flex flex-col p-4 gap-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold"> Your Events</h1>
        <ul className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 py-6">
          {events.map((event) => (
            <a href={`/events/${event.id}`} key={event.id}>
              <div className="border bg-white border-gray-200 rounded-lg w-full h-full p-4 drop-shadow-md" key={event.id}>
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
  );
}