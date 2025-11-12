require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const path = require("path");

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("<h1>Server running</h1>");
});

app.get("/api", (req, res) => {
    res.send(`
        <div>
        <h1>API Reference</h1>
            <ul>
                <li><a href='/api/test'>/api/test</a></li>
            </ul>
        </div>`);
});

app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is up and running... \n✅ http://localhost:${PORT}\n`);
});
