const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/google", authController.getGoogleAuthURL);
router.get("/google/callback", authController.googleCallback);

router.get("/me", authController.me);
router.post("/logout", authController.logout);

module.exports = router;
