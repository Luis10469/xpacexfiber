import { Router } from "express";

import {
  createFactura,
  getFacturas,
  getFacturaById,
  updateEstadoFactura,
  getMisFacturas,
} from "../controllers/facturas.controller.js";

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
  createFactura
);

router.get(
  "/",
  verifyToken,
  checkRole("admin"),
  getFacturas
);

// ======================================
// MIS FACTURAS (CLIENTE)
// ======================================

router.get(
  "/mias",
  verifyToken,
  getMisFacturas
);

// ======================================
// ACTUALIZAR ESTADO (ADMIN)
// ======================================

router.put(
  "/:id/estado",
  verifyToken,
  checkRole("admin"),
  updateEstadoFactura
);

// ======================================
// FACTURA POR ID (ADMIN O DUEÑO)
// ======================================

router.get(
  "/:id",
  verifyToken,
  getFacturaById
);

export default router;
