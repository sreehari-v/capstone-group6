// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/auth.controller");

// router.post("/signup", authController.signup);
// router.post("/login", authController.login);

// router.get("/google", authController.getGoogleAuthURL);
// router.get("/google/callback", authController.googleCallback);

// router.get("/me", authController.me);
// router.post("/logout", authController.logout);

// module.exports = router;
import express from "express";
import {
  signup,
  login,
  getGoogleAuthURL,
  googleCallback,
  me,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/google", getGoogleAuthURL);
router.get("/google/callback", googleCallback);

router.get("/me", me);
router.post("/logout", logout);

export default router;
