import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode"
import { useEffect, useState, useRef } from "react"
import {events, checkInGuest, getGuest} from "../../src/data/events"
import { Select } from "~/components/Select"


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
                setResp(`Checked in ${checkIn.name ?? guestId}`);
            }
        }
        catch(e){
            setResp(String(e));
        }
    }

    const handleChange=(
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        setEventId(Number(value));
    }

    useEffect(() => {
        if (eventId === -1) return;

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
    },[eventId])

    return(
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-neutral-800">Scan QR Code</h1>
                <Select className="max-w-xs" onChange={handleChange} defaultValue="">
                    <option value="" disabled>Select an event</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.title} — {event.date}
                        </option>
                    ))}
                </Select>
            </div>

            {eventId === -1 ? (
                <p className="rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    Select an event above before scanning guest QR codes.
                </p>
            ) : (
                <div id="reader" className="overflow-hidden rounded-xl border border-neutral-200 shadow-card" />
            )}

            {resp && (
                <p className="text-sm text-neutral-600">{resp}</p>
            )}

            <div>
                <h2 className="mb-3 text-lg font-semibold text-neutral-800">Checked in ({scanned.length})</h2>
                {scanned.length === 0 ? (
                    <p className="text-sm text-neutral-500">No guests scanned yet this session.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
                    {scanned.map((guest, index) => (
                        <li key={guest.email ?? `${guest.name}-${index}`} className="flex items-center justify-between bg-neutral-0 px-4 py-3">
                            <span className="font-medium text-neutral-800">{guest.name}</span>
                            <span className="text-sm text-neutral-500">{guest.arrivalTime}</span>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        </main>
    )
}