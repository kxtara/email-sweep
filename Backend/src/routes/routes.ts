import { Router } from "express";
import { accessRequestEmail, auth, gmail, runCleanup } from "../controllers/controller.js";

const router = Router();

router.get("/auth",auth)
router.get("/auth/google/callback",gmail)
router.post("/auth/request",accessRequestEmail)
router.post("/auth/cleanup",runCleanup)
export default router