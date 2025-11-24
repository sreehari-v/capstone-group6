import { google } from "googleapis";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Frontend URL selection:
// Local dev: set FRONTEND_URL in .env to http://localhost:5173 (or uncomment the sample in backend/.env)
// Production: default to the deployed SPA on Render unless overridden via env
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "https://creon-frontend.onrender.com");

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

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
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
        const { id: googleId, email, name, picture: avatar } = data;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                authProvider: "google",
                isVerified: true,
                googleId,
                avatar,
            });
        } else {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                user.avatar = user.avatar || avatar;
                // Mark existing user verified when they link via Google
                user.isVerified = true;
                await user.save();
            }
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

        res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (err) {
        console.error("Google callback error:", err);
        res.status(500).send("Authentication failed");
    }
};

// ===========================
//  Logout
// ===========================
export const logout = (req, res) => {
    // Clear both access and refresh cookies
    res.clearCookie("token", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({ message: "Logged out" });
};

// ===========================
//  Current user info (from token)
// ===========================
export const me = async (req, res) => {
    try {
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
            csrfToken,
        });
    } catch (err) {
        console.error("me error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// ===========================
//  Signup
// ===========================
export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
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
        });

        // Generate a short-lived verification token (24h) and send email
        const verifyToken = jwt.sign({ id: user._id, type: "verify" }, process.env.JWT_SECRET, {
            expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || "1d",
        });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verifyToken}`;

        const html = `<p>Hi ${user.name},</p>
        <p>Welcome to CareOn! Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>If you didn't create an account, ignore this email.</p>`;

        let previewUrl = null;
        try {
            const result = await sendMail({ to: user.email, subject: "Verify your CareOn email", html });
            previewUrl = result?.previewUrl || null;
            if (previewUrl) console.log("Preview URL (Ethereal):", previewUrl);
        } catch (err) {
            console.error("Failed to send verification email:", err);
        }

        // Return user summary but don't auto-login until verified if you prefer
        const responsePayload = { id: user._id, name: user.name, email: user.email, message: "Verification email sent" };
        if (previewUrl && process.env.NODE_ENV !== "production") responsePayload.previewUrl = previewUrl;
        res.status(201).json(responsePayload);
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Signup failed" });
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
    return res.redirect(`${FRONTEND_URL}/login?verified=1`);
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
        res.cookie("token", token, makeCookieOpts(isProd, parseInt(process.env.JWT_EXPIRES_MS || String(15 * 60 * 1000))));
        res.cookie("refreshToken", refreshToken, makeCookieOpts(isProd, parseInt(process.env.JWT_REFRESH_EXPIRES_MS || String(7 * 24 * 60 * 60 * 1000))));

        // Issue a non-httpOnly CSRF token for double-submit protection
        const csrfToken = crypto.randomBytes(24).toString("hex");
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

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
        res.cookie("token", newToken, makeCookieOpts(isProd, parseInt(process.env.JWT_EXPIRES_MS || String(15 * 60 * 1000))));

        // rotate csrf token as well
        const csrfToken = crypto.randomBytes(24).toString("hex");
        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.json({ ok: true, csrfToken });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ message: "Refresh failed" });
    }
};
