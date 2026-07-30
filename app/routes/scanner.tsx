import type { Route } from "./+types/home";
import { QrScan } from "../qrScan/qrScan"
import { Header } from "../header/header"
export default function Scanner(){
    return(
        <>
        <Header/>
        <QrScan/>
        </>
    )
}