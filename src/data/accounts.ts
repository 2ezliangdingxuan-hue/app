import data from "../events.json"
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

const createAccount = async(account:{
    
    name : string;
    email : string;
    number : string;
    password : string;
}) => {
    const res = await fetch(`${API_BASE}/api/accounts`,{
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
    });

    const payload = await res.json();

    if (res.ok && payload.event){
        events.unshift(payload.event);
    }

    return payload;

};

export{createAccount}