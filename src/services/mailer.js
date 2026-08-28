import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
import { encryptId } from "../utils/idCrypto.js";


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

async function sendGuestInviteEmail({to, guestName, guestId, eventTitle, eventId, eventImage}) {
    const qrCodeBuffer = await QRCode.toBuffer((eventId + ":" + guestId),{
        type:"png",
        width: 300,
        margin:1,
    });

    const rsvpLink = `${APP_BASE_URL}/rsvp/${encryptId(eventId)}/${encryptId(guestId)}`;

    const attachments = [
        {
            filename: "guest-qr.png",
            content: qrCodeBuffer,
            contentType:"image/png"
        }
    ];

    let eventImageHtml = "";
    const dataUrlMatch = typeof eventImage === "string" && eventImage.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (dataUrlMatch) {
        const [, contentType, base64Data] = dataUrlMatch;
        attachments.push({
            filename: "event-image.png",
            content: Buffer.from(base64Data, "base64"),
            contentType,
            cid: "event-image",
        });
        eventImageHtml = `<p><img src="cid:event-image" alt="${eventTitle || "Event"}" style="max-width:100%;width:400px;" /></p>`;
    }

    return transporter.sendMail({
        from: `"Event App" <${process.env.SMTP_USER}`,
        to,
        subject: `QRCode for ${eventTitle || "event"}`,
        //Change to actual domain in the future=======================================================================================================================
        html:`
            ${eventImageHtml}
            <p>Hello ${guestName || "there"},</p>
            <p>Your QR code is attached to this email.</p>
            <p>Guest ID: <strong>${guestId}</strong></p>
            <p>Please let us know if you can make it: <a href="${rsvpLink}">RSVP here</a></p>
        `,
        attachments
    })
}

export{sendGuestInviteEmail}