import { query } from "../config/db.js";

// ======================================
// VALIDACIÓN
// ======================================

const TIPOS_VALIDOS = ["noticia", "mantenimiento", "aviso", "promocion"];
const DESTINATARIOS_VALIDOS = ["todos", "especificos"];

class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ======================================
// CREAR NOTICIA Y RESOLVER DESTINATARIOS
// ======================================

export const crearNoticia = async (emisorId, datos) => {
  const {
    titulo,
    contenido,
    tipo = "noticia",
    destinatario_tipo = "todos",
    usuario_ids = [],
  } = datos;

  if (!titulo?.trim()) {
    throw new ServiceError(400, "El título es obligatorio.");
  }

  if (!contenido?.trim()) {
    throw new ServiceError(400, "El contenido es obligatorio.");
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new ServiceError(400, "El tipo de noticia no es válido.");
  }

  if (!DESTINATARIOS_VALIDOS.includes(destinatario_tipo)) {
    throw new ServiceError(400, "El tipo de destinatario no es válido.");
  }

  let idsEspecificos = [];

  if (destinatario_tipo === "especificos") {
    idsEspecificos = [
      ...new Set(
        (usuario_ids || [])
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];

    if (!idsEspecificos.length) {
      throw new ServiceError(
        400,
        "Debe seleccionar al menos un usuario destinatario."
      );
    }

    const params = idsEspecificos;
    const placeholders = params
      .map((_, i) => `@param${i}`)
      .join(", ");

    const existentes = await query(
      `SELECT id FROM usuarios WHERE id IN (${placeholders})`,
      params
    );

    const idsExistentes = new Set(existentes.map((u) => Number(u.id)));
    const idsInvalidos = idsEspecificos.filter(
      (id) => !idsExistentes.has(id)
    );

    if (idsInvalidos.length) {
      throw new ServiceError(
        400,
        `Los siguientes usuario_ids no existen: ${idsInvalidos.join(", ")}`
      );
    }
  }

  const resultado = await query(
    `
    INSERT INTO noticias
    (
      titulo,
      contenido,
      tipo,
      destinatario_tipo,
      emisor_id
    )
    OUTPUT INSERTED.id AS id
    VALUES
    (
      @param0,
      @param1,
      @param2,
      @param3,
      @param4
    )
    `,
    [
      titulo.trim(),
      contenido.trim(),
      tipo,
      destinatario_tipo,
      emisorId,
    ]
  );

  const noticiaId = resultado[0]?.id;

  if (!noticiaId) {
    throw new ServiceError(500, "No se pudo crear la noticia.");
  }

  let destinatarios = 0;

  if (destinatario_tipo === "todos") {
    const insertados = await query(
      `
      INSERT INTO notificaciones
      (
        usuario_id,
        noticia_id,
        titulo,
        mensaje
      )
      OUTPUT INSERTED.id AS id
      SELECT
        id,
        @param0,
        @param1,
        @param2
      FROM usuarios
      WHERE estado = 1
      `,
      [noticiaId, titulo.trim(), contenido.trim()]
    );

    destinatarios = insertados.length;
  } else {
    const params = [
      noticiaId,
      titulo.trim(),
      contenido.trim(),
      ...idsEspecificos,
    ];

    const placeholders = idsEspecificos
      .map((_, i) => `@param${i + 3}`)
      .join(", ");

    const insertados = await query(
      `
      INSERT INTO notificaciones
      (
        usuario_id,
        noticia_id,
        titulo,
        mensaje
      )
      OUTPUT INSERTED.id AS id
      SELECT
        u.id,
        @param0,
        @param1,
        @param2
      FROM usuarios u
      WHERE u.id IN (${placeholders})
      `,
      params
    );

    destinatarios = insertados.length;
  }

  return { noticiaId, destinatarios };
};

// ======================================
// LISTAR NOTICIAS (ADMIN)
// ======================================

export const obtenerNoticias = async (filtros = {}) => {
  const { tipo, buscar } = filtros;

  let sql = `
    SELECT
      n.id,
      n.titulo,
      n.contenido,
      n.tipo,
      n.fecha_publicacion,
      n.estado,
      n.destinatario_tipo,
      n.emisor_id,
      u.nombre AS emisor_nombre,
      COUNT(not_.id) AS destinatarios_count,
      SUM(CASE WHEN not_.leido = 1 THEN 1 ELSE 0 END) AS leidos_count
    FROM noticias n
    LEFT JOIN usuarios u ON u.id = n.emisor_id
    LEFT JOIN notificaciones not_ ON not_.noticia_id = n.id
    WHERE 1 = 1
  `;

  const params = [];

  if (tipo) {
    sql += ` AND n.tipo = @param${params.length}`;
    params.push(tipo);
  }

  if (buscar) {
    sql += ` AND n.titulo LIKE @param${params.length}`;
    params.push(`%${buscar}%`);
  }

  sql += `
    GROUP BY
      n.id, n.titulo, n.contenido, n.tipo, n.fecha_publicacion,
      n.estado, n.destinatario_tipo, n.emisor_id, u.nombre
    ORDER BY n.fecha_publicacion DESC
  `;

  return await query(sql, params);
};

// ======================================
// MIS NOTIFICACIONES (CUALQUIER USUARIO)
// ======================================

export const obtenerMisNotificaciones = async (usuarioId, opciones = {}) => {
  const { leido, limit } = opciones;

  const params = [usuarioId];

  let sql = `
    SELECT
      ${limit ? `TOP ${Number(limit)}` : ""}
      n.id,
      n.noticia_id,
      n.titulo,
      n.mensaje,
      n.leido,
      n.leido_at,
      n.created_at,
      no.tipo,
      no.fecha_publicacion
    FROM notificaciones n
    LEFT JOIN noticias no ON no.id = n.noticia_id
    WHERE n.usuario_id = @param0
  `;

  if (leido === "0" || leido === false || leido === 0) {
    sql += ` AND n.leido = 0`;
  } else if (leido === "1" || leido === true || leido === 1) {
    sql += ` AND n.leido = 1`;
  }

  sql += ` ORDER BY n.created_at DESC`;

  const notificaciones = await query(sql, params);

  const pendientes = await query(
    `SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = @param0 AND leido = 0`,
    [usuarioId]
  );

  return {
    notificaciones,
    noLeidas: pendientes[0]?.total || 0,
  };
};

// ======================================
// MARCAR UNA NOTIFICACIÓN COMO LEÍDA
// ======================================

export const marcarNotificacionLeida = async (id, usuarioId) => {
  const resultado = await query(
    `
    UPDATE notificaciones
    SET
      leido = 1,
      leido_at = GETDATE()
    OUTPUT INSERTED.id AS id
    WHERE id = @param0 AND usuario_id = @param1
    `,
    [id, usuarioId]
  );

  if (!resultado.length) {
    throw new ServiceError(404, "Notificación no encontrada.");
  }

  return true;
};

// ======================================
// MARCAR TODAS COMO LEÍDAS
// ======================================

export const marcarTodasLeidas = async (usuarioId) => {
  await query(
    `
    UPDATE notificaciones
    SET
      leido = 1,
      leido_at = GETDATE()
    WHERE usuario_id = @param0 AND leido = 0
    `,
    [usuarioId]
  );

  return true;
};
