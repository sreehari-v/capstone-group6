import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

// Creates transporter based on env. If SMTP config isn't provided, fall back to
// an Ethereal test account (development only).
export async function createTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;

    // Prefer Gmail OAuth2 if configured
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && SMTP_USER) {
        const oAuth2Client = new google.auth.OAuth2(
            GMAIL_CLIENT_ID,
            GMAIL_CLIENT_SECRET
        );
        oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

        let accessToken = null;
        try {
            const atResponse = await oAuth2Client.getAccessToken();
            accessToken = atResponse?.token || atResponse;
        } catch (err) {
            console.warn("Failed to retrieve Gmail access token:", err?.message || err);
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: SMTP_USER,
                clientId: GMAIL_CLIENT_ID,
                clientSecret: GMAIL_CLIENT_SECRET,
                refreshToken: GMAIL_REFRESH_TOKEN,
                accessToken,
            },
        });

        try {
            await transporter.verify();
            console.log("Gmail OAuth2 transporter verified");
        } catch (err) {
            console.warn("Gmail transporter verification failed:", err?.message || err);
        }

        return transporter;
    }

    if (SMTP_HOST && SMTP_USER) {
        const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
        const secure = port === 465;

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port,
            secure,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        // Verify connection configuration (useful to log early failures)
        try {
            await transporter.verify();
            console.log("SMTP transporter verified");
        } catch (err) {
            console.warn("SMTP transporter verification failed:", err?.message || err);
        }

        return transporter;
    }

    // Fallback to Ethereal (dev) — creates a test account
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

export async function sendMail({ to, subject, html, text }) {
    const transporter = await createTransporter();

    const from = process.env.EMAIL_FROM || `CareOn <no-reply@careon.local>`;

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
    });

    // Log provider response to help debugging (messageId / response)
    try {
        console.log("Email sent: messageId=", info.messageId);
        if (info.response) console.log("Provider response:", info.response);
    } catch (err) {
        /* ignore logging errors */
    }

    // If using Ethereal, return the preview URL for development
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl && process.env.NODE_ENV !== "production") {
        console.log("Preview URL (Ethereal):", previewUrl);
    }

    return { info, previewUrl };
}

export default { createTransporter, sendMail };
