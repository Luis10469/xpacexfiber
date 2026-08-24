import { obtenerReportes } from "../services/reportes.service.js";

// ======================================
// REPORTES Y ESTADÍSTICAS
// ======================================

export const getReportes = async (req, res) => {

  try {

    const data = await obtenerReportes(req.query);

    res.json({
      ok: true,
      ...data,
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};
