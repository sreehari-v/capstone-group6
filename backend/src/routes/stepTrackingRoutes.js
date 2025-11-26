// backend/src/routes/stepTrackingRoutes.js
import express from "express";
import { getMySteps, saveMySteps } from "../controllers/stepTrackingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMySteps);
router.put("/me", protect, saveMySteps);

export default router;
