import { Html5Qrcode } from "html5-qrcode"
import { useEffect, useState } from "react"
import {events} from "../../src/data/events"
export function QrScan() { 
    const [resp, setResp] = useState("")
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
                        <select className="border">
                            <option>Select An Event</option>
                            {events.map((event) => (
                                <option>
                                    {event.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div id="reader"/>
                <a>respondus: {resp}</a>
            </div>
            
        </main>
        
    )
}