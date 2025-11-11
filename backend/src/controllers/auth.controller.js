const { google } = require("googleapis");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

exports.getGoogleAuthURL = (req, res) => {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes
    });

    return res.redirect(url);
};

exports.googleCallback = async (req, res) => {
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
                googleId,
                avatar
            });
        } else {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                user.avatar = user.avatar || avatar;
                await user.save();
            }
        }

        const token = generateToken(user);
        const isProd = process.env.NODE_ENV === "production";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        const redirectTo = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${redirectTo}/dashboard`);
    } catch (err) {
        console.error("Google callback error:", err);
        res.status(500).send("Authentication failed");
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token", { path: "/" });
    res.json({ message: "Logged out" });
};

exports.me = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            authProvider: user.authProvider,
        });
    } catch (err) {
        console.error("me error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local"
        });

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Signup failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password || "");
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Login failed" });
    }
};
