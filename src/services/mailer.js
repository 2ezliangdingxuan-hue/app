import QRCode from "qrcode";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendGuestInviteEmail({to, guestName, guestId, eventTitle}) {
    const qrCodeBuffer = await QRCode.toBuffer(guestId,{
        type:"png",
        width: 300,
        margin:1,
    });

    return transporter.sendMail({
        from: `"Event App" <${process.env,SMTP_USER}`,
        to,
        subject: `QRCode for ${eventTitle || "event"}`,
        html:`
            <p>Hello ${guestName || "there"},</p>
            <p>Your QR code is attached to this email.</p>
            <p>Guest ID: <strong>${guestId}</strong></p>
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