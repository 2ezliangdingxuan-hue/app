import data from "../events.json";
const API_BASE = "http://localhost:3001";

import QRCode from "qrcode";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// type InviteEmail = {
//     to: string;
//     guestName: string;
//     guestId: string;
//     eventTitle: string;
// }
// async function sendGuestInviteEmail(InviteEmail) {
//     const qrCodeBuffer = await QRCode.toBuffer(InviteEmail.guestId,{
//         type:"png",
//         width: 300,
//         margin:1,
//     });

//     return transporter.sendMail({
//         from: `"Event App" <${process.env,SMTP_USER}`,
//         InviteEmail.to,
//         subject: `QRCode for ${InviteEmail.eventTitle || "event"}`,
//         html:`
//             <p>Hello ${InviteEmail.guestName || "there"},</p>
//             <p>Your QR code is attached to this email.</p>
//             <p>Guest ID: <strong>${InviteEmail.guestId}</strong></p>
//         `,
//         attachments:[
//             {
//                 filename: "guest-qr.png",
//                 content: qrCodeBuffer,
//                 contentType:"image/png"
//             }
//         ]
//     })
// }


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
    title: string; 
    description: string; 
    date: string; 
    location?: string;
    category: string; 
    img: string; 
    guests?: Record<string, Guest>
};

const events = data.events as Event[];

const getEvents = async () =>{
    const res = await fetch(`${API_BASE}/api/events`);
    console.log(res);
    return res;
}

const getEventById = async (id: string) =>{
    const res = await fetch(`${API_BASE}/api/events/${id}`);
    console.log(res);
    return res;
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
}
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
}

export {events, getEvents, getEventById, checkInGuest, addGuest};