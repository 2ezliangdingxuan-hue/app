import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { encryptId } from "../utils/idCrypto.js";

const APP_BASE_URL = process.env.APP_BASE_URL || "https://localhost:5173";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

function formatEventDate(dateString) {
    if (!dateString) return "";
    try {
        if (dateString.includes("•") || dateString.includes("–") || dateString.includes(" to ")) {
            return dateString;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [y, m, d] = dateString.split("-").map(Number);
            const localDate = new Date(y, m - 1, d);
            return localDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
}

/**
 * Generates email-client compatible HTML for the guest invitation.
 * Styled with GatherEase theme: Forest green (#2c633b), warm amber (#f5a524),
 * and warm stone neutrals (#fdfaf7 / #f7f1ea / #ece2d6).
 */
export function generateInviteEmailHtml({
    guestName,
    guestId,
    eventTitle,
    eventDate,
    eventLocation,
    eventDescription,
    rsvpLink,
    eventImageSrc,
}) {
    const formattedDate = formatEventDate(eventDate);
    const safeTitle = eventTitle || "Special Event";
    const safeGuestName = guestName || "Honored Guest";

    const imageBannerHtml = eventImageSrc
        ? `
        <tr>
            <td align="center" style="padding: 0; background-color: #ece2d6;">
                <img src="${eventImageSrc}" alt="${safeTitle}" width="600" style="display: block; width: 100%; max-width: 600px; max-height: 280px; object-fit: cover; border: 0;" />
            </td>
        </tr>
        `
        : "";

    const eventDetailsRows = [];
    if (formattedDate) {
        eventDetailsRows.push(`
            <tr>
                <td style="padding: 6px 0; font-size: 14px; line-height: 20px; color: #4c443b;">
                    <span style="font-weight: 700; color: #221e19; display: inline-block; width: 80px;">📅 Date:</span>
                    <span>${formattedDate}</span>
                </td>
            </tr>
        `);
    }
    if (eventLocation) {
        eventDetailsRows.push(`
            <tr>
                <td style="padding: 6px 0; font-size: 14px; line-height: 20px; color: #4c443b;">
                    <span style="font-weight: 700; color: #221e19; display: inline-block; width: 80px;">📍 Venue:</span>
                    <span style="text-transform: capitalize;">${eventLocation}</span>
                </td>
            </tr>
        `);
    }

    const eventDetailsHtml =
        eventDetailsRows.length > 0
            ? `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f1ea; border: 1px solid #ece2d6; border-radius: 12px; margin: 20px 0 24px 0;">
                <tr>
                    <td style="padding: 16px 20px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            ${eventDetailsRows.join("")}
                        </table>
                    </td>
                </tr>
            </table>
            `
            : "";

    const isHtmlContent = eventDescription && /<[a-z][\s\S]*>/i.test(eventDescription);
    const descriptionHtml = eventDescription
        ? isHtmlContent
            ? `<div style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #4c443b;">${eventDescription}</div>`
            : `<p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #6b6155; font-style: italic;">&ldquo;${eventDescription}&rdquo;</p>`
        : "";

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Invitation to ${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fdfaf7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #332d27;">

    <!-- Hidden Preheader text for inbox snippet preview -->
    <div style="display: none; font-size: 1px; color: #fdfaf7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        You're invited to ${safeTitle}! Your personal entry QR pass &amp; RSVP link are inside.
    </div>

    <!-- Outer Container Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdfaf7; padding: 24px 12px 40px 12px;">
        <tr>
            <td align="center">
                <!-- Main Email Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #ece2d6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(34, 30, 25, 0.06);">
                    
                    <!-- Header Bar -->
                    <tr>
                        <td style="background-color: #2c633b; padding: 20px 28px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                                                    GatherEase
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); color: #ffffff; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                                            Official Invitation
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Optional Event Banner Image -->
                    ${imageBannerHtml}

                    <!-- Invitation Body -->
                    <tr>
                        <td style="padding: 32px 32px 20px 32px;">
                            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #8f8272; text-transform: uppercase; letter-spacing: 0.05em;">
                                You are invited
                            </p>
                            <h1 style="margin: 0 0 16px 0; font-size: 26px; line-height: 32px; font-weight: 800; color: #221e19; letter-spacing: -0.02em;">
                                ${safeTitle}
                            </h1>

                            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #4c443b;">
                                Hello <strong style="color: #221e19;">${safeGuestName}</strong>, you have been invited to attend this event.
                            </p>

                            ${descriptionHtml}
                            ${eventDetailsHtml}
                        </td>
                    </tr>

                    <!-- Hero QR Code Pass (Ticket Container) -->
                    <tr>
                        <td style="padding: 0 32px 28px 32px;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f7f1; border: 2px dashed #8fbf99; border-radius: 14px; text-align: center;">
                                <tr>
                                    <td style="padding: 24px 20px;" align="center">
                                        <div style="font-size: 11px; font-weight: 800; color: #234f30; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
                                            🎟️ Admit One &bull; Digital Check-In Pass
                                        </div>

                                        <!-- QR Code Frame -->
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background-color: #ffffff; padding: 12px; border-radius: 12px; border: 1px solid #dcecdf; box-shadow: 0 2px 8px rgba(34, 30, 25, 0.05);" align="center">
                                                    <img src="cid:guest-qr" alt="Personal QR Pass" width="180" height="180" style="display: block; width: 180px; height: 180px; border: 0;" />
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Guest ID Badge -->
                                        <div style="margin-top: 14px;">
                                            <span style="display: inline-block; background-color: #ffffff; border: 1px solid #b9d9bf; border-radius: 9999px; padding: 4px 14px; font-size: 12px; font-weight: 700; color: #234f30; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                                                Guest ID: #${guestId}
                                            </span>
                                        </div>

                                        <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 18px; color: #2c633b; font-weight: 500;">
                                            Please present this QR code at the entrance for entry.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Call To Action (RSVP) -->
                    <tr>
                        <td align="center" style="padding: 0 32px 32px 32px;">
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #4c443b; font-weight: 500;">
                                Please confirm whether you can join us:
                            </p>

                            <!-- Primary Button -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 9999px; background-color: #2c633b; box-shadow: 0 2px 8px rgba(44, 99, 59, 0.25);">
                                        <a href="${rsvpLink}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px; letter-spacing: 0.01em;">
                                            RSVP &amp; Confirm Attendance &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Fallback Link -->
                            <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 18px; color: #8f8272;">
                                Button not working? You can also respond by visiting:<br />
                                <a href="${rsvpLink}" target="_blank" style="color: #2c633b; word-break: break-all; font-weight: 600; text-decoration: underline;">
                                    ${rsvpLink}
                                </a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fdfaf7; border-top: 1px solid #ece2d6; padding: 24px 32px; text-align: center;">
                            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #6b6155;">
                                GatherEase &bull; Effortless Event &amp; Guest Management
                            </p>
                            <p style="margin: 0; font-size: 11px; line-height: 16px; color: #b7a794;">
                                This invitation is intended specifically for ${safeGuestName}. Please do not forward or duplicate your unique check-in pass.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Generates a clean plain-text fallback version for clients without HTML support.
 */
export function generateInviteEmailText({
    guestName,
    guestId,
    eventTitle,
    eventDate,
    eventLocation,
    eventDescription,
    rsvpLink,
}) {
    const formattedDate = formatEventDate(eventDate);
    const safeTitle = eventTitle || "Special Event";
    const safeGuestName = guestName || "Guest";

    const lines = [
        `==================================================`,
        ` GATHEREASE - EVENT INVITATION`,
        `==================================================`,
        ``,
        `Hello ${safeGuestName},`,
        ``,
        `You have been invited to: ${safeTitle}`,
    ];

    if (formattedDate) {
        lines.push(`Date: ${formattedDate}`);
    }
    if (eventLocation) {
        lines.push(`Venue: ${eventLocation}`);
    }
    if (eventDescription) {
        const plainDesc = eventDescription
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim();
        lines.push(``, `"${plainDesc}"`);
    }

    lines.push(
        ``,
        `--------------------------------------------------`,
        `DIGITAL ENTRY PASS`,
        `--------------------------------------------------`,
        `Guest ID: #${guestId}`,
        `Your personalized QR check-in pass is attached to this email (guest-qr.png).`,
        `Please present it upon arrival at the venue.`,
        ``,
        `--------------------------------------------------`,
        `RSVP CONFIRMATION`,
        `--------------------------------------------------`,
        `Please confirm your attendance here:`,
        `${rsvpLink}`,
        ``,
        `==================================================`,
        `GatherEase - Effortless Event & Guest Management`,
        `==================================================`
    );

    return lines.join("\n");
}

async function sendGuestInviteEmail({
    to,
    guestName,
    guestId,
    eventTitle,
    eventId,
    eventImage,
    eventDate,
    eventLocation,
    eventDescription,
}) {
    // Generate high-resolution QR code with deep forest green brand color
    const qrCodeBuffer = await QRCode.toBuffer(
        encryptId(eventId) + ":" + encryptId(guestId),
        {
            type: "png",
            width: 360,
            margin: 2,
            color: {
                dark: "#16321f", // Brand-900 forest dark
                light: "#ffffff",
            },
        }
    );

    const rsvpLink = `${APP_BASE_URL}/rsvp/${encryptId(eventId)}/${encryptId(guestId)}`;

    const attachments = [
        {
            filename: "guest-qr.png",
            content: qrCodeBuffer,
            contentType: "image/png",
            cid: "guest-qr", // Embedded inline in the digital ticket pass
        },
    ];

    let eventImageSrc = "";
    const dataUrlMatch =
        typeof eventImage === "string" &&
        eventImage.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);

    if (dataUrlMatch) {
        const [, contentType, base64Data] = dataUrlMatch;
        attachments.push({
            filename: "event-image.png",
            content: Buffer.from(base64Data, "base64"),
            contentType,
            cid: "event-image",
        });
        eventImageSrc = "cid:event-image";
    } else if (
        typeof eventImage === "string" &&
        (eventImage.startsWith("http://") || eventImage.startsWith("https://"))
    ) {
        eventImageSrc = eventImage;
    }

    const htmlContent = generateInviteEmailHtml({
        guestName,
        guestId,
        eventTitle,
        eventDate,
        eventLocation,
        eventDescription,
        rsvpLink,
        eventImageSrc,
    });

    const textContent = generateInviteEmailText({
        guestName,
        guestId,
        eventTitle,
        eventDate,
        eventLocation,
        eventDescription,
        rsvpLink,
    });

    return transporter.sendMail({
        from: `"GatherEase" <${process.env.SMTP_USER}>`,
        to,
        subject: `Invitation & Entry Pass: ${eventTitle || "Special Event"}`,
        text: textContent,
        html: htmlContent,
        attachments,
    });
}

export { sendGuestInviteEmail };