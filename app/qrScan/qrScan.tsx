import { Html5Qrcode } from "html5-qrcode"
import { useEffect, useState } from "react"
import {events, checkInGuest, getGuest} from "../../src/data/events"
import { useNavigate } from "react-router";

type Guest = {
    name: string; 
    arrived?: boolean; 
    status?:string; 
    arrivalTime?:string|null;
    email?:string;
    number?: string;
};

export function QrScan() { 
    const [scanned, setScanned] = useState<Guest[] >([]);
    const [resp, setResp] = useState("");
    let [eventId, setEventId] = useState<number>(-1);
    const[curEvent, setCurEvent] = useState();
    //----------------------------------------------------------------------------------------

    async function handleScan(value: string){
        const pos = value.indexOf(":")

        const guestEvent=value.slice(0, pos)
        const guestId=value.slice(pos + 1)

        if (String(eventId) !== guestEvent){
            console.log("Event does not match!")
            return;
        }
        
        await checkInGuest(String(eventId), guestId)
        const checkIn = await getGuest(guestEvent, guestId)

        if (checkIn){
            console.log(`check in : ${checkIn}`)
            setScanned(prev => [...prev, checkIn])
        }
    }

    const handleChange=(
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        setEventId(Number(value))
        console.log({name, value});
        //navigate("/");
    }

    useEffect(() => {
        const scanner = new Html5Qrcode("reader")
        scanner.start(
            {facingMode:"environment"},
            {
                fps:30,
                qrbox:{
                    width: 400,
                    height: 400,
                },
            },
            (decodedText)=>{
                console.log("QR code :" , decodedText);
                setResp(decodedText);
                handleScan(decodedText);
                //-------------------------------------------------------------
                scanner.stop();
            },
            (error) => {
                console.log(error)
            }
        )
        .catch(console.error);

        return () => {
            scanner
            .stop()
            .catch(() => {})
            .finally(() => scanner.clear())
        }
    },[])
    return(
        <main>
            <div className="p-8">
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-2xl">Scan Qr Code :</h1>
                    <div className="flex flex-col">
                        <select className="border"  onChange={
                            handleChange
                        }>
                            <option>Select An Event</option>
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.id}: {event.title} , {event.date}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div id="reader"></div>
                <form className="py-2 space-x-2">
                    <label> test : </label>
                    <input className="border">
                </input>
                <button className="border px-1"> submit</button>
                </form>
                
                <a>respondus: {resp}</a>
                <ul>
                {scanned.map((guest) => (
                    <li> 
                        <div>
                            {guest.name} : {guest.arrivalTime}
                        </div>
                    </li>
                ))}
                </ul>
            </div>
        </main>
    )
}