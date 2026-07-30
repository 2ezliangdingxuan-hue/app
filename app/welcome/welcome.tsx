import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
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
    <main className="flex flex-col items-center justify-center pt-16 pb-4">
        <body>
          <div className="w=full">
            <img src={Banner} alt="Banner" className="w-full h-auto object-cover" />
          </div>
          <div className="flex flex-col p-4 gap-4">
            <h1 className="text-2xl font-bold"> Your Events</h1>
            <ul className="gap-4 flex flex-row py-6">
              {events.map((event) => (
                <a href={`/events/${event.id}`} key={event.id}>
                  <div className="border bg-white border-gray-200 rounded-lg p-4 drop-shadow-md" key={event.id}>
                    <li key={event.id} className="flex flex-col gap-2">
                      <h2>{event.title}</h2>
                      <img src={event.img} alt={event.title} />
                      <p>{event.date}</p>
                    </li>
                  </div>
                </a>
              ))}
            </ul>
        </div>
      </body>
    </main>
  );
}

