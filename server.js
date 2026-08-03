import express from "express";
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import cors from "cors";
import { configDotenv } from "dotenv";
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
    const data = readData();
    const nextId= Math.max(0, ...data.events.map((event) => Number(event.id) || 0)) + 1;
}

app.get("/api/events", (req, res) => {
    const events = readData().events;
    res.json(events);
});

app.post("/api/events", (req, res) =>{
    const data = readData();
    const title = req.body?.title?.trim();
    const description = req.body?.description?.trim();
    const date = req.body?.location?.trim();
    const location = req.body?.location?.trim();
    const category = req.body?.category?.trim();

    if (!title || !description || !date || !location || !category){
        return res.status(400).json({error:"All event fields are required"})
    }

    const nextId= Math.max(0, ...data.events.map((event) => Number(event.id) || 0)) + 1;

    const newEvent = {
        id:nextId,
        title,
        description,
        date,
        category,
        location,
        img: 
        req.body?.img || 
        "https://th.bing.com/th/id/OIP.VdDc3iT3PCrJnnsiThNzGgHaF_?w=245&h=199&c=7&r=0&o=7&pid=1.7&rm=3",
        guests:{},
    }

    data.events.push(newEvent);
    writeData(data);

    res.status(201).json({ok: true, event: newEvent});

});

app.put("/api/events/:eventId", (req, res) => {
    const data = readData();
    const event=data.events.find((event) => String(event.id) === req.params.eventId);
    if (!event){
        return res.status(404).json({error: "Event not found"});
    }

    if (req.body?.date) event.date = req.body.date;
    if (req.body?.location) event.location = req.body.location;
    if (req.body?.description) event.description = req.body.description;

    writeData(data);
    res.json({ok: true, event});
})

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
        eventId: eventId,
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