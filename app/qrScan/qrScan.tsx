// import { useOutletContext } from "react-router";
import { Html5Qrcode } from "html5-qrcode"
//import { decode } from "punycode"
import { useEffect, useState } from "react"
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
            <script src="https://unpkg.com/html5-qrcode" type="text/javascript"/>
            <div className="p-8">
                <h1 className="mb-4">Scan Qr Code :</h1>
                <div id="reader"/>
                <a>respondus: {resp}</a>
            </div>
            
        </main>
        
    )
}