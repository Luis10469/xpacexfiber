import { Router } from "express";

import {
  createNoticia,
  getNoticias,
  getMisNotificaciones,
  marcarLeida,
  marcarTodas,
} from "../controllers/noticias.controller.js";

import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";

const router = Router();

// ======================================
// ADMIN
// ======================================

router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  createNoticia
);

router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  getNoticias
);

// ======================================
// NOTIFICACIONES DEL USUARIO LOGUEADO
// ======================================

router.get(
  "/mias",
  verifyToken,
  getMisNotificaciones
);

router.put(
  "/notificaciones/leido-todas",
  verifyToken,
  marcarTodas
);

router.put(
  "/notificaciones/:id/leido",
  verifyToken,
  marcarLeida
);

export default router;
