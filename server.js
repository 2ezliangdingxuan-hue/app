import express from "express";
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import cors from "cors";
import { configDotenv } from "dotenv";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { sendGuestInviteEmail } from "./src/services/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashPassword(password){
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored){
    const [salt, hash] = String(stored || "").split(":");
    if (!salt || !hash) return false;
    const hashBuf = Buffer.from(hash, "hex");
    const derivedBuf = scryptSync(password, salt, hashBuf.length);
    return hashBuf.length === derivedBuf.length && timingSafeEqual(hashBuf, derivedBuf);
}

function base64url(input){
    return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signToken(payload){
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedBody = base64url(JSON.stringify(body));
    const signature = base64url(
        createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedBody}`).digest()
    );
    return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyToken(token){
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSignature = base64url(
        createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedBody}`).digest()
    );
    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)){
        return null;
    }
    try{
        const payload = JSON.parse(Buffer.from(encodedBody, "base64").toString("utf8"));
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}


const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));

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
    const maxGuests = Number(req.body?.maxGuests);
    const description = req.body?.description?.trim();
    const date = req.body?.date?.trim();
    const location = req.body?.location?.trim();
    const category = req.body?.category?.trim();

    if (!title || !maxGuests || Number.isNaN(maxGuests) || !description || !date || !location || !category){
        return res.status(400).json({error:"All event fields are required"})
    }

    const nextId= Math.max(0, ...data.events.map((event) => Number(event.id) || 0)) + 1;

    const newEvent = {
        id:nextId,
        title,
        maxGuests,
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

    if(req.body?.title) event.title = req.body.title;
    if (req.body?.date) event.date = req.body.date;
    if (req.body?.location) event.location = req.body.location;
    if (req.body?.description) event.description = req.body.description;
    if (req.body?.category) event.category = req.body.category;
    if (req.body?.img) event.img = req.body.img;
    if (req.body?.maxGuests && !Number.isNaN(Number(req.body.maxGuests))) event.maxGuests = Number(req.body.maxGuests);

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
    const selfSignup = req.body?.selfSignup === true;
    const guest = {
        name: guestName,
        email: req.body?.email?.trim() || "",
        number: req.body?.number?.trim() || "",
        arrived: false,
        status: "Not-Arrived",
        arrivalTime: null,
        rsvp: selfSignup ? "Going" : "Pending",
        rsvpAt: selfSignup ? new Date().toISOString() : null,
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

app.get("/api/events/:eventId/guest/:guestId/rsvp", (req, res) => {
    const data = readData();
    const eventId = req.params.eventId;
    const guestId = req.params.guestId;
    const event = data.events.find((event) => String(event.id) === String(eventId));

    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }

    if (!event?.guests || !(guestId in event.guests)) {
        return res.status(404).json({ error: "Guest not found" });
    }

    const guest = event.guests[guestId];

    res.json({
        ok: true,
        guest: { name: guest.name, rsvp: guest.rsvp ?? "Pending", rsvpAt: guest.rsvpAt ?? null },
        event: { title: event.title, date: event.date, location: event.location },
    });
});

app.post("/api/events/:eventId/guest/:guestId/rsvp", (req, res) => {
    const data = readData();
    const eventId = req.params.eventId;
    const guestId = req.params.guestId;
    const event = data.events.find((event) => String(event.id) === String(eventId));

    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }

    if (!event?.guests || !(guestId in event.guests)) {
        return res.status(404).json({ error: "Guest not found" });
    }

    const response = req.body?.response;
    if (response !== "Going" && response !== "Declined") {
        return res.status(400).json({ error: "RSVP response must be 'Going' or 'Declined'" });
    }

    event.guests[guestId].rsvp = response;
    event.guests[guestId].rsvpAt = new Date().toISOString();

    writeData(data);

    res.json({ ok: true, guest: event.guests[guestId] });
});

app.get("/api/events/:eventId/guest/:guestId", (req,res) =>{
    const data = readData();
    const eventId = req.params.eventId;
    const guestId = req.params.guestId;
    const event = data.events.find((event) => String(event.id) === String(eventId));
    if (!event) return res.status(404);
    const guest = event.guests[guestId];
    if (!guest) return res.status(404);
    
    return res.json({ok: true, guest})
});

app.post("/api/accounts", (req,res) =>{
    const data = readData();
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim();
    const number = req.body?.number?.trim();
    const password = req.body?.password?.trim();

    if ( !name || !email || !number || !password){
        return res.status(400).json({error:"All account fields are required"})
    }

    const emailTaken = data.accounts.some(
        (account) => account.email?.toLowerCase() === email.toLowerCase()
    );
    if (emailTaken){
        return res.status(409).json({error:"An account with that email already exists"})
    }

    const nextId= Math.max(0, ...data.accounts.map((account) => Number(account.id) || 0)) + 1;

    const newAccount = {
        id: nextId,
        email,
        name,
        number,
        password: hashPassword(password),
    }

    data.accounts.push(newAccount);
    writeData(data);

    const { password: _password, ...accountWithoutPassword } = newAccount;
    res.status(201).json({ok: true, account: accountWithoutPassword});
})

app.post("/api/sign-in", (req, res) => {
    const data = readData();
    const email = req.body?.email?.trim();
    const password = req.body?.password?.trim();

    if (!email || !password){
        return res.status(400).json({error: "Email and password are required"});
    }

    const account = data.accounts.find(
        (account) => account.email?.toLowerCase() === email.toLowerCase()
    );

    if (!account || !verifyPassword(password, account.password)){
        return res.status(401).json({error: "Invalid email or password"});
    }

    const token = signToken({ sub: String(account.id) });
    const { password: _password, ...accountWithoutPassword } = account;
    res.json({ok: true, token, account: accountWithoutPassword});
});

app.get("/api/me", (req, res) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = verifyToken(token);

    if (!payload){
        return res.status(401).json({error: "Invalid or expired session"});
    }

    const data = readData();
    const account = data.accounts.find((account) => String(account.id) === payload.sub);

    if (!account){
        return res.status(401).json({error: "Account not found"});
    }

    const { password: _password, ...accountWithoutPassword } = account;
    res.json({ok: true, account: accountWithoutPassword});
});

app.listen(3001, () => {
    console.log("Server Express Running")
});