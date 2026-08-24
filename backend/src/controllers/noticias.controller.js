import {
  crearNoticia,
  obtenerNoticias,
  obtenerMisNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "../services/noticias.service.js";

// ======================================
// CREAR / PUBLICAR NOTICIA
// ======================================

export const createNoticia = async (req, res) => {

  try {

    const resultado = await crearNoticia(req.user.id, req.body);

    res.status(201).json({
      ok: true,
      message: "Noticia publicada correctamente",
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
// LISTAR NOTICIAS (ADMIN)
// ======================================

export const getNoticias = async (req, res) => {

  try {

    const noticias = await obtenerNoticias(req.query);

    res.json({
      ok: true,
      noticias,
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
// MIS NOTIFICACIONES
// ======================================

export const getMisNotificaciones = async (req, res) => {

  try {

    const { leido, limit } = req.query;

    const resultado = await obtenerMisNotificaciones(req.user.id, {
      leido,
      limit,
    });

    res.json({
      ok: true,
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
// MARCAR UNA NOTIFICACIÓN COMO LEÍDA
// ======================================

export const marcarLeida = async (req, res) => {

  const { id } = req.params;

  try {

    await marcarNotificacionLeida(id, req.user.id);

    res.json({
      ok: true,
      message: "Notificación marcada como leída",
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
// MARCAR TODAS COMO LEÍDAS
// ======================================

export const marcarTodas = async (req, res) => {

  try {

    await marcarTodasLeidas(req.user.id);

    res.json({
      ok: true,
      message: "Todas las notificaciones fueron marcadas como leídas",
    });

  } catch (error) {

    console.error(error);

    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    });

  }

};
