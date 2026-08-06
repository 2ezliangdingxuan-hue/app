import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode"
import { useEffect, useState, useRef } from "react"
import {events, checkInGuest, getGuest} from "../../src/data/events"


type Guest = {
    name: string; 
    arrived?: boolean; 
    status?:string; 
    arrivalTime?:string|null;
    email?:string;
    number?: string;
};

export function QrScan() { 
    const STORAGE_KEY  = 'Scanned'
    const [scanned, setScanned] = useState<Guest[]>([]);
    const hydrated = useRef(false);

    useEffect(() => {
        try{
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) setScanned(JSON.parse(saved));
        } catch{
            
        }
        hydrated.current = true;
    }, []);

    useEffect(() => {
        if (!hydrated.current) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scanned));
    }, [scanned]);
    const [resp, setResp] = useState("");
    let [eventId, setEventId] = useState<number>(-1);
    const eventIdRef = useRef(eventId);
    useEffect(()=>{eventIdRef.current=eventId},[eventId]);
    const lastScannedRef = useRef<string | null>(null);
    const scannedKeysRef = useRef<Set<string>>(new Set());

    async function handleScan(value: string){
        const pos = value.indexOf(":");

        const guestEvent=value.slice(0 , pos);
        const guestId=value.slice(pos + 1);

        if (String(eventIdRef.current) !== guestEvent){
            console.log("Event does not match!");
            setResp("Event does not match!");
            return;
        }

        const key = `${guestEvent}:${guestId}`;
        if (scannedKeysRef.current.has(key)){
            setResp("Guest already scanned");
            return;
        }
        try{
            await checkInGuest(String(eventIdRef.current), guestId);
            const checkIn = await getGuest(guestEvent, guestId);

            if (checkIn){
                console.log(`check in : ${checkIn}`);
                scannedKeysRef.current.add(key);
                setScanned(prev => [...prev, checkIn]);
            }
        } 
        catch(e){
            setResp(String(e));
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const id = String(formData.get('id'));
        setResp(id);
        handleScan(id);
        console.log(id);
    }
    
    const handleChange=(
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        setEventId(Number(value));
        console.log({name, value});
        //navigate("/");
    }

    useEffect(() => {
        const scanner = new Html5Qrcode("reader")
        const startPromise = scanner.start(
            {facingMode:"environment"},
            {
                fps:30,
                qrbox:{
                    width: 400,
                    height: 400,
                },
            },
            (decodedText)=>{
                if (decodedText === lastScannedRef.current){
                    return;
                }
                lastScannedRef.current = decodedText;
                try{
                    console.log("QR code :" , decodedText);
                    setResp(decodedText);
                    handleScan(decodedText);
                }
                catch(e){
                    setResp(String(e));
                    console.log(e);
                }
            },
            (error) => {
                console.log(error);
            }
        )
        .catch(console.error);

        return () => {
            startPromise.finally(() => {
                const state = scanner.getState();
                if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED){
                    scanner.stop().catch(() => {}).finally(() => scanner.clear());
                } else {
                    scanner.clear();
                }
            });
        }
    },[])
    return(
        <main>
            <div className="p-8">
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-2xl">Scan Qr Code :</h1>
                    <div className="flex flex-col">
                        <select className="border"  
                        onChange={handleChange}>
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
                <form onSubmit={handleSubmit} className="py-2 space-x-2">
                    <label> test : </label>
                    <input type="text" name="id" className="border">
                </input>
                <button className="border px-1"> submit</button>
                </form>
                
                <a href="/page">respondus: {resp}</a>
                <ul>
                {scanned.map((guest, index) => (
                    <li key={guest.email ?? `${guest.name}-${index}`}>
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