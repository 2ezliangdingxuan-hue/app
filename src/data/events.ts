import data from "../events.json";
const API_BASE = typeof window !== "undefined"
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3001";


type Guest = {
    name: string; 
    arrived?: boolean; 
    status?:string; 
    arrivalTime?:string|null;
    email?:string;
    number?: string;
};

type Event = {
    id: number; 
    title?: string; 
    description?: string; 
    date?: string; 
    location?: string;
    category: string;
    img: string;
    maxGuests?: number;
    guests?: Record<string, Guest>
};

const events = data.events as Event[];

const getEvents = async () =>{
    const res = await fetch(`${API_BASE}/api/events`);
    console.log(res);
    return res;
};

const createEvent = async(event:{
    title:string;
    maxGuests: string;
    description: string;
    date: string;
    location: string;
    category: string;
    img?: string;
}) => {
    const res = await fetch(`${API_BASE}/api/events`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
    });

    const payload = await res.json();

    if (res.ok && payload.event){
        events.unshift(payload.event);
    }

    return payload;

};

const getEventById = async (id: string) =>{
    const res = await fetch(`${API_BASE}/api/events/${id}`);
    console.log(res);
    return res;
};

const updateEvent = async (
    eventId: string,
    updates:{
        title?: string;
        date? :string;
        location?: string;
        description?: string;
        img?: string;
        maxGuests?: string;
    }
) =>{
    const res = await fetch(`${API_BASE}/api/events/${eventId}`,{
        method: "PUT",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });
    return res.json();
}

const addGuest = async (eventId: string, guest: Partial<Guest> & {name:string}) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/newguest`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(guest),
    });

    const payload = await res.json();
    const event = events.find((item) => String(item.id) === eventId);
    if(event){
        if(!event.guests){
            event.guests={};
        }
        event.guests[payload.guestId] = payload.guest;
    }

    return payload;
};

const checkInGuest = async (eventId: string, guestId: string) => {
    const event = events.find((event) => String(event.id) === eventId);
    if (event?.guests && String(guestId) in event.guests) {
        event.guests[String(guestId)].arrived = true;
        event.guests[String(guestId)].status = "Arrived"
        const res = await fetch(`${API_BASE}/api/events/${eventId}/check-in/${guestId}`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
        });
        console.log(res);
        return true;
    }
    return false;
};

const getGuest = async (eventId: string, guestId: string) =>{
    const res = await fetch(`${API_BASE}/api/events/${eventId}/guest/${guestId}`,{
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        }
    })
    const payload = await res.json();
    return payload.guest;
}

export {events, getEvents, createEvent, getEventById, checkInGuest, addGuest, updateEvent, getGuest};