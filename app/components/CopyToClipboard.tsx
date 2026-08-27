import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { encryptId } from "~/utils/idCrypto";

type CopyProps = {
    eventId: String
}
export function Copy({eventId}:CopyProps){
    const [isCopied, setIsCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const curID = encryptId(String(eventId))

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const handleCopy = async () =>{
        try{
            await navigator.clipboard.writeText(`${baseUrl}/form/${curID}`)
            setIsCopied(true)
            setTimeout(()=>setIsCopied(false),2000)
        }catch(e){
            console.log(e)
        }
    }
    const linkToForm = `${baseUrl}/form/${curID}`
    return(
        <>
        <div className = "flex flex-row gap-2 justify-center items-center">
            <a href={linkToForm}><p className="text-center">{baseUrl}/form/{curID}</p></a>
            <button className="border rounded-full px-2 py-1"
            onClick={handleCopy}> 
            Copy 
            </button>
        </div>
        </>
    )
}