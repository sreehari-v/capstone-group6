import express from "express";
import {
  signup,
  login,
  getGoogleAuthURL,
  googleCallback,
  me,
  logout,
  verifyEmail,
  verifyEmailJson,
} from "../controllers/auth.controller.js";

import { refresh } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmailJson);

router.get("/google", getGoogleAuthURL);
router.get("/google/callback", googleCallback);

router.get("/me", me);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
