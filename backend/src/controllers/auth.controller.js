import { google } from "googleapis";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import generateRefreshToken from "../utils/generateRefreshToken.js";
import { sendMail } from "../utils/mailer.js";

// Helper to produce consistent cookie options
const makeCookieOpts = (isProd, maxAge) => ({
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path: "/",
});

// Google OAuth
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// ===========================
// Google Login URL
// ===========================
export const getGoogleAuthURL = (req, res) => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ];

    // Allow passing a small state payload (e.g. gender) which Google will round-trip
    const statePayload = {};
    if (req.query?.gender) statePayload.gender = req.query.gender;

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
        state: Object.keys(statePayload).length ? JSON.stringify(statePayload) : undefined,
    });

    return res.redirect(url);
};

// ===========================
// Google Auth Callback
// ===========================
export const googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) return res.status(400).send("No code provided");

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
        const { data } = await oauth2.userinfo.get();
        const { id: googleId, email, name, picture: avatar, gender: googleGender } = data;

        // Try to fetch extended profile info (People API) to get birthday/gender when available
        let peopleGender = null;
        let computedAge = null;
        try {
            const people = google.people({ auth: oauth2Client, version: "v1" });
            const person = await people.people.get({ resourceName: "people/me", personFields: "birthdays,genders" });
            if (person?.data) {
                // genders is an array; take the first value if present
                if (Array.isArray(person.data.genders) && person.data.genders.length) {
                    peopleGender = person.data.genders[0].value || null;
                }
                // birthdays array may contain objects with a date {year, month, day}
                if (Array.isArray(person.data.birthdays) && person.data.birthdays.length) {
                    const b = person.data.birthdays[0].date || null;
                    if (b && typeof b.year === "number") {
                        const now = new Date();
                        const by = Number(b.year);
                        const bm = Number(b.month || 1) - 1;
                        const bd = Number(b.day || 1);
                        const dob = new Date(by, bm, bd);
                        let age = now.getFullYear() - dob.getFullYear();
                        const m = now.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
                        if (!Number.isNaN(age) && age >= 0) computedAge = age;
                    }
                }
            }
        } catch (pe) {
            // People API may not return data or scopes may not have been approved — continue gracefully
            console.warn("People API lookup failed or not permitted:", pe && pe.message ? pe.message : pe);
        }

        let user = await User.findOne({ email });

        // Parse any state passed through the OAuth round-trip (may include small payloads)
        let stateGender = null;
        try {
            if (req.query?.state) {
                const parsed = JSON.parse(req.query.state);
                if (parsed?.gender) stateGender = parsed.gender;
            }
        } catch (e) {
            // ignore parse errors
        }

        if (!user) {
            user = await User.create({
                name,
                email,
                authProvider: "google",
                isVerified: true,
                googleId,
                avatar,
                // Prefer stateGender, then People API gender, then oauth2 userinfo gender
                gender: stateGender || peopleGender || googleGender || null,
                // Persist computed age when available
                age: computedAge ?? null,
            });
        } else {
            let modified = false;
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                user.avatar = user.avatar || avatar;
                // Mark existing user verified when they link via Google
                user.isVerified = true;
                modified = true;
            }
            // If we have a gender from state or People API or Google's profile, persist it if not set
            if (!user.gender && (stateGender || peopleGender || googleGender)) {
                user.gender = stateGender || peopleGender || googleGender;
                modified = true;
            }
            // Persist computed age if we have one and user.age is not set
            if ((user.age === undefined || user.age === null) && computedAge !== null) {
                user.age = computedAge;
                modified = true;
            }
            if (modified) await user.save();
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const isProd = process.env.NODE_ENV === "production";

        // Access token cookie (short-lived)
        res.cookie("token", token, makeCookieOpts(isProd, parseInt(process.env.JWT_EXPIRES_MS || String(15 * 60 * 1000))));
        // Refresh token cookie (longer-lived)
        res.cookie("refreshToken", refreshToken, makeCookieOpts(isProd, parseInt(process.env.JWT_REFRESH_EXPIRES_MS || String(7 * 24 * 60 * 60 * 1000))));

        // Issue CSRF token for double-submit
        const csrfToken = crypto.randomBytes(24).toString("hex");
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        const redirectTo =
            process.env.FRONTEND_URL || "http://localhost:5173";

        res.redirect(`${redirectTo}/dashboard`);
    } catch (err) {
        console.error("Google callback error:", err);
        res.status(500).send("Authentication failed");
    }
};

// ===========================
//  Logout
// ===========================
export const logout = (req, res) => {
    // Log incoming cookies for debug purposes (helps diagnose why clearCookie
    // sometimes doesn't remove cookies when path/sameSite/domain mismatches occur).
    try {
        console.debug('logout: incoming cookies ->', Object.keys(req.cookies || {}));
    } catch (e) {
        console.warn('logout: failed to read req.cookies', e);
    }

    // Clear both access and refresh cookies using the same options that were
    // applied when the cookies were originally set (httpOnly, secure, sameSite).
    const isProd = process.env.NODE_ENV === "production";

    // Use makeCookieOpts to produce matching options; set maxAge to 0 when clearing
    res.clearCookie("token", makeCookieOpts(isProd, 0));
    res.clearCookie("refreshToken", makeCookieOpts(isProd, 0));

    // csrfToken was set as a non-httpOnly cookie earlier — clear with matching options
    res.clearCookie("csrfToken", {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 0,
        path: "/",
    });

    // As an extra fallback, also explicitly set expired cookies (some browsers
    // respond better to an explicit past expiration). Use the same options.
    try {
        res.cookie("token", "", { ...makeCookieOpts(isProd, 0), expires: new Date(0) });
        res.cookie("refreshToken", "", { ...makeCookieOpts(isProd, 0), expires: new Date(0) });
        res.cookie("csrfToken", "", { httpOnly: false, secure: isProd, sameSite: isProd ? "none" : "lax", expires: new Date(0), path: "/" });
    } catch (e) {
        // best-effort — don't crash logout if this fails
        console.debug('logout: explicit expire cookies failed', e?.message || e);
    }

    // Return a debug hint in non-production to help client-side diagnostics
    if (process.env.NODE_ENV !== 'production') {
        return res.json({ message: "Logged out", cookiesReceived: Object.keys(req.cookies || {}) });
    }

    return res.json({ message: "Logged out" });
};

// ===========================
//  Current user info (from token)
// ===========================
export const me = async (req, res) => {
    try {
        // Debug: log cookie keys to help diagnose 401s during development
        try {
            const ck = Object.keys(req.cookies || {});
            console.log('me: incoming cookies ->', ck);
        } catch (e) {
            console.log('me: failed to read cookies', e);
        }

        const token = req.cookies?.token;
        if (!token)
            return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Issue a non-httpOnly CSRF token for double-submit protection
        const isProd = process.env.NODE_ENV === "production";
        const csrfToken = crypto.randomBytes(24).toString("hex");
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            authProvider: user.authProvider,
            age: user.age ?? null,
            height: user.height ?? null,
            weight: user.weight ?? null,
            gender: user.gender ?? null,
            csrfToken,
        });
    } catch (err) {
        console.error("me error:", err && err.message ? err.message : err);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// ===========================
//  Signup
// ===========================
export const signup = async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local",
            isVerified: false,
            gender: gender || null,
        });

        // Generate a short-lived verification token (24h) and send email
        const verifyToken = jwt.sign({ id: user._id, type: "verify" }, process.env.JWT_SECRET, {
            expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || "1d",
        });

        const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verifyToken}`;

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const displayName = (user && typeof user.name === 'string' && user.name.trim()) ? (user.name.trim().charAt(0).toUpperCase() + user.name.trim().slice(1)) : 'User';
        const html = `
                <!doctype html>
                <html>
                    <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width,initial-scale=1" />
                        <title>Verify your CareOn email</title>
                    </head>
                    <body style="margin:0;padding:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fb;color:#0f1720;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                                            <td style="padding:48px 0 20px 0; text-align:center;">
                                                                                                    <a href="${frontendUrl}" style="text-decoration:none;display:inline-block;text-align:center;">
                                                                                                        <!-- Text-based logo for maximum compatibility -->
                                                                                                        <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#0d3b66; font-weight:800; font-size:24px; letter-spacing:0.2px;">CareOn</div>
                                                                                                        <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#64748b; font-size:12px; margin-top:4px;">Breathe better. Live healthier.</div>
                                                                                                    </a>
                                                                                                </td>
                                                        </tr>
                            <tr>
                                <td align="center">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="420" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(16,24,40,0.12);">
                                        <tr>
                                            <td style="padding:44px 28px;">
                                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#0d3b66;">Verify your email</h1>
                                                <p style="margin:0 0 16px 0;color:#475569;line-height:1.45;">Hi ${displayName},</p>
                                                <p style="margin:0 0 20px 0;color:#475569;line-height:1.45;">Thanks for creating a CareOn account. Click the button below to verify your email and finish setting up your profile.</p>
                                                <div style="text-align:center;margin:36px 0;">
                                                    <a href="${verifyUrl}" style="background:#0d9488;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:700;font-size:15px;">Verify my email</a>
                                                </div>
                                                <p style="margin:0 0 12px 0;color:#94a3b8;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                                                <p style="word-break:break-all;color:#0d3b66;font-size:12px;margin:0 0 8px 0;">${verifyUrl}</p>
                                                <hr style="border:none;border-top:1px solid #eef2f6;margin:22px 0;" />
                                                <p style="color:#64748b;font-size:13px;margin:0;">If you didn't create an account with CareOn, you can safely ignore this message.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#f8fafc;padding:18px 36px;text-align:center;color:#94a3b8;font-size:13px;">CareOn - Your personal breathing & health companion<br/>Need help? <a href="mailto:support@careon.app" style="color:#0d9488;text-decoration:none;">support@careon.app</a></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:22px 0;text-align:center;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} CareOn. All rights reserved.</td>
                            </tr>
                        </table>
                    </body>
                </html>
                `;

        // Send verification email asynchronously (fire-and-forget) so a slow
        // mail provider does not block user signup API responses. Log errors
        // when they occur but don't delay the HTTP response.
        sendMail({ to: user.email, subject: "Verify your CareOn email", html })
            .then((result) => {
                const previewUrl = result?.previewUrl || null;
                if (previewUrl) console.log("Preview URL (Ethereal):", previewUrl);
            })
            .catch((err) => {
                console.error("Failed to send verification email:", err);
            });

        // Return user summary but don't auto-login until verified
        const responsePayload = { id: user._id, name: user.name, email: user.email, message: "Verification email queued" };
        res.status(201).json(responsePayload);
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Signup failed" });
    }
};

// ===========================
// Resend verification email
// POST /api/auth/resend-verification
// ===========================
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email });
        // Always respond quickly; if no user exists, don't reveal that info
        if (!user) return res.json({ message: "If an account exists, a verification email was queued" });

        if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

        // Generate short-lived verification token
        const verifyToken = jwt.sign({ id: user._id, type: "verify" }, process.env.JWT_SECRET, {
            expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || "1d",
        });

        const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verifyToken}`;

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const displayName = (user && typeof user.name === 'string' && user.name.trim()) ? (user.name.trim().charAt(0).toUpperCase() + user.name.trim().slice(1)) : 'User';
        const html = `
                <!doctype html>
                <html>
                    <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width,initial-scale=1" />
                        <title>Verify your CareOn email</title>
                    </head>
                    <body style="margin:0;padding:0;font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fb;color:#0f1720;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                                            <td style="padding:48px 0 20px 0; text-align:center;">
                                                                                                    <a href="${frontendUrl}" style="text-decoration:none;display:inline-block;text-align:center;">
                                                                                                        <!-- Text-based logo for maximum compatibility -->
                                                                                                        <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#0d3b66; font-weight:800; font-size:24px; letter-spacing:0.2px;">CareOn</div>
                                                                                                        <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#64748b; font-size:12px; margin-top:4px;">Breathe better. Live healthier.</div>
                                                                                                    </a>
                                                                                                </td>
                                                        </tr>
                            <tr>
                                <td align="center">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="420" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(16,24,40,0.12);">
                                        <tr>
                                            <td style="padding:44px 28px;">
                                                <h1 style="margin:0 0 8px 0;font-size:20px;color:#0d3b66;">Verify your email</h1>
                                                <p style="margin:0 0 16px 0;color:#475569;line-height:1.45;">Hi ${displayName},</p>
                                                <p style="margin:0 0 20px 0;color:#475569;line-height:1.45;">Thanks for creating a CareOn account. Click the button below to verify your email and finish setting up your profile.</p>
                                                <div style="text-align:center;margin:36px 0;">
                                                    <a href="${verifyUrl}" style="background:#0d9488;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:700;font-size:15px;">Verify my email</a>
                                                </div>
                                                <p style="margin:0 0 12px 0;color:#94a3b8;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                                                <p style="word-break:break-all;color:#0d3b66;font-size:12px;margin:0 0 8px 0;">${verifyUrl}</p>
                                                <hr style="border:none;border-top:1px solid #eef2f6;margin:22px 0;" />
                                                <p style="color:#64748b;font-size:13px;margin:0;">If you didn't create an account with CareOn, you can safely ignore this message.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#f8fafc;padding:18px 36px;text-align:center;color:#94a3b8;font-size:13px;">CareOn - Your personal breathing & health companion<br/>Need help? <a href="mailto:support@careon.app" style="color:#0d9488;text-decoration:none;">support@careon.app</a></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:22px 0;text-align:center;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} CareOn. All rights reserved.</td>
                            </tr>
                        </table>
                    </body>
                </html>
                `;

        // Fire-and-forget send
        sendMail({ to: user.email, subject: "Verify your CareOn email", html })
            .then((result) => {
                const previewUrl = result?.previewUrl || null;
                if (previewUrl) console.log("Preview URL (Ethereal):", previewUrl);
            })
            .catch((err) => {
                console.error("Failed to resend verification email:", err);
            });

        return res.json({ message: "Verification email queued" });
    } catch (err) {
        console.error("Resend verification error:", err);
        return res.status(500).json({ message: "Failed to queue verification email" });
    }
};

// ===========================
//  Verify email
// ===========================
export const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send("Missing token");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) return res.status(400).send("Invalid token");

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).send("User not found");

        user.isVerified = true;
        await user.save();

        // Redirect to frontend with a flag
        const redirectTo = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${redirectTo}/login?verified=1`);
    } catch (err) {
        console.error("Verify email error:", err);
        return res.status(400).send("Token invalid or expired");
    }
};

// ===========================
//  Verify email (JSON API)
//    Use this endpoint from SPA clients (POST /api/auth/verify-email)
// ===========================
export const verifyEmailJson = async (req, res) => {
    try {
        const token = req.body?.token || req.query?.token;
        if (!token) return res.status(400).json({ ok: false, message: "Missing token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) return res.status(400).json({ ok: false, message: "Invalid token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        user.isVerified = true;
        await user.save();

        return res.json({ ok: true, message: "Email verified" });
    } catch (err) {
        console.error("Verify email (json) error:", err);
        return res.status(400).json({ ok: false, message: "Token invalid or expired" });
    }
};

// ===========================
//  Login
// ===========================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res
                .status(400)
                .json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password || "");
        if (!valid)
            return res.status(401).json({ message: "Invalid credentials" });

        // Prevent login if email not verified
        if (user.isVerified === false) {
            return res.status(403).json({ message: "Please verify your email before logging in" });
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        const isProd = process.env.NODE_ENV === "production";

    // Set access and refresh cookies
    const tokenOpts = makeCookieOpts(isProd, parseInt(process.env.JWT_EXPIRES_MS || String(15 * 60 * 1000)));
    const refreshOpts = makeCookieOpts(isProd, parseInt(process.env.JWT_REFRESH_EXPIRES_MS || String(7 * 24 * 60 * 60 * 1000)));
    console.debug('auth: setting token cookie opts ->', tokenOpts);
    console.debug('auth: setting refreshToken cookie opts ->', refreshOpts);
    res.cookie("token", token, tokenOpts);
    res.cookie("refreshToken", refreshToken, refreshOpts);


        // Issue a non-httpOnly CSRF token for double-submit protection
        const csrfToken = crypto.randomBytes(24).toString("hex");
        const csrfOpts = { httpOnly: false, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" };
        console.debug('auth: setting csrfToken cookie opts ->', csrfOpts);
        res.cookie("csrfToken", csrfToken, csrfOpts);

        res.json({ id: user._id, name: user.name, email: user.email, csrfToken });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Login failed" });
    }
};

// ===========================
// Refresh access token endpoint
// POST /api/auth/refresh
// ===========================
export const refresh = async (req, res) => {
    try {
        const r = req.cookies?.refreshToken;
        if (!r) return res.status(401).json({ message: "No refresh token" });

        const decoded = jwt.verify(r, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        if (!decoded?.id) return res.status(401).json({ message: "Invalid refresh token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });


        const newToken = generateToken(user);
        const isProd = process.env.NODE_ENV === "production";
        const tokenOpts = makeCookieOpts(isProd, parseInt(process.env.JWT_EXPIRES_MS || String(15 * 60 * 1000)));
        console.debug('auth.refresh: setting token cookie opts ->', tokenOpts);
        res.cookie("token", newToken, tokenOpts);

        // rotate csrf token as well
        const csrfToken = crypto.randomBytes(24).toString("hex");
        const csrfOpts = { httpOnly: false, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" };
        console.debug('auth.refresh: setting csrfToken cookie opts ->', csrfOpts);
        res.cookie("csrfToken", csrfToken, csrfOpts);

        // Note: refresh-token session tracking removed — keep refresh cookie as-is

        return res.json({ ok: true, csrfToken });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ message: "Refresh failed" });
    }
};

// ===========================
// Update profile
// PUT /api/auth/profile
// ===========================
export const updateProfile = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, email, avatar, age, height, weight, gender } = req.body || {};
        if (typeof name === 'string' && name.trim()) user.name = name.trim();
        if (typeof email === 'string' && email.trim()) user.email = email.trim();
        if (typeof avatar === 'string') user.avatar = avatar;

        // Accept numeric profile fields if provided
        if (age !== undefined && age !== null && age !== '') {
            const n = Number(age);
            if (!Number.isNaN(n)) user.age = n;
        }
        if (height !== undefined && height !== null && height !== '') {
            const n = Number(height);
            if (!Number.isNaN(n)) user.height = n;
        }
        if (weight !== undefined && weight !== null && weight !== '') {
            const n = Number(weight);
            if (!Number.isNaN(n)) user.weight = n;
        }

        // Accept gender if provided (allow empty to unset)
        if (typeof gender === 'string') {
            const g = gender.trim();
            if (g === '') user.gender = null;
            else user.gender = g;
        }

        await user.save();

        return res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, age: user.age, height: user.height, weight: user.weight, gender: user.gender });
    } catch (err) {
        console.error("updateProfile error:", err);
        return res.status(500).json({ message: "Profile update failed" });
    }
};

// ===========================
// List sessions for current user
// GET /api/auth/sessions
// ===========================
// listSessions removed — session management was a prototype and has been reverted

// ===========================
// Revoke a single session (logout device)
// POST /api/auth/sessions/revoke
// body: { tokenPreview || token } (we'll accept full token)
// ===========================
// revokeSession removed — session management was a prototype and has been reverted

// ===========================
// Change password
// POST /api/auth/change-password
// ===========================
export const changePassword = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { oldPass, newPass } = req.body || {};
        if (!newPass || newPass.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });

        // If user has a password, verify oldPass
        if (user.password) {
            const ok = await bcrypt.compare(oldPass || '', user.password);
            if (!ok) return res.status(403).json({ message: "Current password incorrect" });
        }

        const hashed = await bcrypt.hash(newPass, 10);
        user.password = hashed;
        await user.save();

        return res.json({ ok: true, message: "Password changed" });
    } catch (err) {
        console.error("changePassword error:", err);
        return res.status(500).json({ message: "Password change failed" });
    }
};

// ===========================
// Delete account
// DELETE /api/auth/delete
// ===========================
export const deleteAccount = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(user._id);

        // clear cookies
        res.clearCookie('token', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('csrfToken', { path: '/' });

        return res.json({ ok: true, message: 'Account deleted' });
    } catch (err) {
        console.error('deleteAccount error:', err);
        return res.status(500).json({ message: 'Delete failed' });
    }
};

// ===========================
// Logout all devices (best-effort)
// POST /api/auth/logout-all
// ===========================
export const logoutAll = async (req, res) => {
    try {
        // Clear cookies for this client (no server-side session store)
        res.clearCookie('token', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        res.clearCookie('csrfToken', { path: '/' });
        return res.json({ ok: true, message: 'Logged out (client cookies cleared)' });
    } catch (err) {
        console.error('logoutAll error:', err);
        return res.status(500).json({ message: 'Logout-all failed' });
    }
};
