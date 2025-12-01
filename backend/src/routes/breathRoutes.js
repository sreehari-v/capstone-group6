import express from "express";
import { createBreathSession, listMySessions } from "../controllers/breath.controller.js";

const router = express.Router();

// Create a new breath session (authenticated via token cookie)
router.post("/", createBreathSession);

// List current user's recent sessions
router.get("/", listMySessions);

export default router;
