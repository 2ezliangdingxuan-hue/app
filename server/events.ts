import data from "../src/events.json";
const API_BASE = typeof window !== "undefined"
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3001";


type Guest = {
    name: string;
    arrived?: boolean;
    status?:string;
    arrivalTime?:string|null;
    email?:string;
    remarks?:string;
    number?: string;
    rsvp?: "Pending" | "Going" | "Declined";
    rsvpAt?: string | null;
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
    collaboratorIds?: number[];
};

type CollaboratorAccount = {
    id: number;
    name: string;
    email: string;
};

const events = data.events as Event[];

const CATEGORY_OPTIONS = ["public", "private", "invite-only", "internal"];

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
}, token?: string | null) => {
    const res = await fetch(`${API_BASE}/api/events`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        category?: string;
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

const editGuest = async (
    guestId: string,
    details:{
        name: string;
        email: string;
        number: string;
        remark: string;
        rsvp:string;
    }
) => {
    
}

const addGuest = async (eventId: string, guest: Partial<Guest> & {name:string; selfSignup?: boolean}) => {
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
    let res = null;
    if (event?.guests && String(guestId) in event.guests) {
        event.guests[String(guestId)].arrived = true;
        event.guests[String(guestId)].status = "Arrived"
        res = await fetch(`${API_BASE}/api/events/${eventId}/check-in/${guestId}`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
        });
        console.log(res);
        return true;
    }
    else{
        try{
            res = await fetch(`${API_BASE}/api/events/${eventId}/check-in/${guestId}`,{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
        });
        }
        catch(e){
            console.log(e);
        }
        console.log("Guest does not exist.");
        console.log(res);
        return false;
    }
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

const getGuestRsvp = async (eventId: string, guestId: string) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/guest/${guestId}/rsvp`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const payload = await res.json();
    return { ok: res.ok, ...payload };
};

const submitRsvp = async (eventId: string, guestId: string, response: "Going" | "Declined") => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/guest/${guestId}/rsvp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
    });
    const payload = await res.json();

    if (res.ok && payload.guest) {
        const event = events.find((item) => String(item.id) === eventId);
        if (event?.guests && guestId in event.guests) {
            event.guests[guestId].rsvp = payload.guest.rsvp;
            event.guests[guestId].rsvpAt = payload.guest.rsvpAt;
        }
    }

    return { ok: res.ok, ...payload };
};

const getCollaborators = async (eventId: string) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/collaborators`);
    const payload = await res.json();
    return {
        ok: res.ok,
        owner: payload.owner as CollaboratorAccount | null,
        collaborators: (payload.collaborators || []) as CollaboratorAccount[],
        error: payload.error as string | undefined,
    };
};

const inviteCollaborator = async (eventId: string, email: string, token: string | null) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/collaborators`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
    });
    const payload = await res.json();
    return { ok: res.ok, collaborator: payload.collaborator as CollaboratorAccount | undefined, error: payload.error as string | undefined };
};

const removeCollaborator = async (eventId: string, accountId: number, token: string | null) => {
    const res = await fetch(`${API_BASE}/api/events/${eventId}/collaborators/${accountId}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const payload = await res.json();
    return { ok: res.ok, error: payload.error as string | undefined };
};

export {events, getEvents, createEvent, getEventById, checkInGuest, addGuest, updateEvent, getGuest, getGuestRsvp, submitRsvp, getCollaborators, inviteCollaborator, removeCollaborator, editGuest, CATEGORY_OPTIONS};
export type { CollaboratorAccount };