import { Router } from "express";

import { getReportes } from "../controllers/reportes.controller.js";

import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";

const router = Router();

router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  getReportes
);

export default router;
