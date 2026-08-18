import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";


const APP_BASE_URL = process.env.APP_BASE_URL || "https://localhost:5173";

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendGuestInviteEmail({to, guestName, guestId, eventTitle, eventId}) {
    const qrCodeBuffer = await QRCode.toBuffer((eventId + ":" + guestId),{
        type:"png",
        width: 300,
        margin:1,
    });

    const rsvpLink = `${APP_BASE_URL}/rsvp/${eventId}/${guestId}`;

    return transporter.sendMail({
        from: `"Event App" <${process.env.SMTP_USER}`,
        to,
        subject: `QRCode for ${eventTitle || "event"}`,
        //Change to actual domain in the future=======================================================================================================================
        html:`
            <p>Hello ${guestName || "there"},</p>
            <p>Your QR code is attached to this email.</p>
            <p>Guest ID: <strong>${guestId}</strong></p>
            <p>Please let us know if you can make it: <a href="${rsvpLink}">RSVP here</a></p>
        `,
        attachments:[
            {
                filename: "guest-qr.png",
                content: qrCodeBuffer,
                contentType:"image/png"
            }
        ]
    })
}

export{sendGuestInviteEmail}