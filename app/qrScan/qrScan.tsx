import { Html5Qrcode } from "html5-qrcode"
import { useEffect, useState } from "react"
import {events, checkInGuest} from "../../src/data/events"

export function QrScan() { 
    const [resp, setResp] = useState("");
    let eventId=-1;
    const[curEvent, setCurEvent] = useState();
    const handleChange=(
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        eventId=Number(value);
        console.log({name, value});
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
                resp
                checkInGuest
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
                <a>respondus: {resp}</a>
            </div>
        </main>
    )
}