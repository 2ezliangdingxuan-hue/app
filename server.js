import express from "express";
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import cors from "cors";
import { sendGuestInviteEmail } from "./src/services/mailer.js";

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.resolve("src/events.json");
const readData = () => JSON.parse(readFileSync(dataPath, "utf8"));
const writeData = (data) => writeFileSync(dataPath, JSON.stringify(data,null,2), "utf8");

function findNextGuest(event){
    if ( !event?.guests || typeof event.guests !== "object"){
        return "1";
    }
    const ids = Object.keys(event.guests)
        .map((guestId) => Number(guestId))    
        .filter((guestId) => Number.isFinite(guestId));
    return String(ids.length > 0 ? Math.max(...ids) + 1 : 1);
}

function findMaxEvent(){
    const events = readData().events;
}

app.get("/api/events", (req, res) => {
    const events = readData().events;
    res.json(events);
});

app.get("/api/events/:id", (req, res) => {
    const event = readData().events.find((event) => String(event.id) === req.params.id);
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
});

app.get("/api/events/:eventId/guests", (req, res) =>{
    const event = readData().events.find((event) => String(event.id) === req.params.id);
    const guests = event.guests;
    res.json(guests);
});

app.post("/api/events/:eventId/newguest", (req, res) => {
    const data = readData();
    const eventId = req.params.eventId;
    const event = data.events.find((event) => String(event.id) === eventId);
    
    if (!event){
        return res.status(404).json({error: "Event not found" });
    }

    const guestName = req.body?.name?.trim();
    if (!guestName){
        return res.status(400).json({error:"Guest name is required"})
    }

    if(!event.guests || typeof event.guests !== "object"){
        event.guests = {};
    }

    const newGuestId = findNextGuest(event);
    const guest = {
        name: guestName,
        email: req.body?.email?.trim() || "",
        number: req.body?.number?.trim() || "",
        arrived: false,
        status: "Not-Arrived",
        arrivalTime: null,
    };
    event.guests[newGuestId] = guest;
    try{
        sendGuestInviteEmail({
        to: guest.email, 
        guestName: guest.name, 
        guestId: newGuestId, 
        eventTitle: event.title,
    })
    }
    catch (e){
        console.log(e)
    }
    
    writeData(data);

    res.status(201).json({ok: true, guestId: newGuestId, guest, event})
});

app.post("/api/events/:eventId/check-in/:guestId", (req,res) => {
    const data = readData();
    const eventId = req.params.eventId;
    const guestId = req.params.guestId;
    const event = data.events.find((event) => String(event.id) === String(eventId));

    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }

    if (!event?.guests || !(guestId in event.guests)){
        return res.status(404).json({error: "Guest not found"})
    }

    if (event.guests[guestId].arrived == true){
        event.guests[guestId].arrived = false;
        event.guests[guestId].status = "Not-Arrived";
        event.guests[guestId].arrivalTime = null;
    }
    else {
        event.guests[guestId].arrived = true;
        event.guests[guestId].status = "Arrived";
        event.guests[guestId].arrivalTime = new Date().toLocaleTimeString()
    }

    
    // event.guests[guestId].arrived = true;
    // event.guests[guestId].status = "Arrived";
    writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

    res.json({ok: true, event});
});

app.listen(3001, () => {
    console.log("Server Express Running")
});