import {
  crearFactura,
  obtenerFacturas,
  obtenerFacturaPorId,
  actualizarEstadoFactura,
  obtenerMisFacturas,
} from "../services/facturas.service.js";

// ======================================
// CREAR / PUBLICAR FACTURA
// ======================================

export const createFactura = async (req, res) => {

  try {

    const resultado = await crearFactura(req.user.id, req.body);

    res.status(201).json({
      ok: true,
      message: "Factura publicada correctamente",
      ...resultado,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};

// ======================================
// LISTAR FACTURAS (ADMIN)
// ======================================

export const getFacturas = async (req, res) => {

  try {

    const facturas = await obtenerFacturas(req.query);

    res.json({
      ok: true,
      facturas,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};

// ======================================
// FACTURA POR ID
// ======================================

export const getFacturaById = async (req, res) => {

  try {

    const factura = await obtenerFacturaPorId(req.params.id, req.user);

    res.json({
      ok: true,
      factura,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};

// ======================================
// ACTUALIZAR ESTADO
// ======================================

export const updateEstadoFactura = async (req, res) => {

  try {

    const factura = await actualizarEstadoFactura(req.params.id, req.body.estado);

    res.json({
      ok: true,
      message: "Estado actualizado correctamente",
      factura,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};

// ======================================
// MIS FACTURAS (CLIENTE)
// ======================================

export const getMisFacturas = async (req, res) => {

  try {

    const facturas = await obtenerMisFacturas(req.user, req.query);

    res.json({
      ok: true,
      facturas,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};
