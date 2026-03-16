import { Router } from "express";
import { accessRequestEmail, auth, gmail } from "../controllers/controller";

const router = Router();

router.get("/auth",auth)
router.get("/auth/google/callback",gmail)
router.post("/auth/request",accessRequestEmail)

export default router