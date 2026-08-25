import { query } from "../config/db.js";

// ======================================
// PERMISOS
// ======================================

const puedeGestionarTickets = (usuario) =>
  ["admin", "tecnico"].includes(usuario?.rol);

const filtroVisibilidad = (usuario, params) => {
  if (puedeGestionarTickets(usuario)) return "";

  params.push(usuario?.id);

  return ` AND c.usuario_id = @param${params.length - 1}`;
};

// ======================================
// OBTENER TODOS LOS TICKETS
// ======================================

export const obtenerTickets = async (filtros = {}, usuario) => {
  const {
    estado,
    prioridad,
    buscar,
    orden = "recientes",
  } = filtros;

  let sql = `
    WITH UltimoMensaje AS (
      SELECT
        tm.ticket_id,
        tm.fecha AS ultima_actividad,
        u.rol AS ultimo_rol,
        ROW_NUMBER() OVER (
          PARTITION BY tm.ticket_id
          ORDER BY tm.fecha DESC, tm.id DESC
        ) AS fila
      FROM ticket_mensajes tm
      INNER JOIN usuarios u
        ON u.id = tm.usuario_id
    )

    SELECT
      t.id,
      t.asunto,
      t.descripcion,
      t.prioridad,
      t.estado,
      t.tecnico_id,
      t.fecha_creacion,
      t.fecha_actualizacion,

      um.ultima_actividad,

      CASE
        WHEN um.ultimo_rol = 'cliente'
          AND t.estado NOT IN ('Resuelto', 'Cerrado')
        THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
      END AS requiere_respuesta_admin,

      CASE
        WHEN um.ultimo_rol IN ('admin', 'tecnico')
          AND t.estado <> 'Cerrado'
        THEN CAST(1 AS BIT)
        ELSE CAST(0 AS BIT)
      END AS tiene_respuesta_pendiente,

      c.id AS cliente_id,
      u.nombre AS cliente

    FROM tickets t

    INNER JOIN clientes c
      ON c.id = t.cliente_id

    INNER JOIN usuarios u
      ON u.id = c.usuario_id

    LEFT JOIN UltimoMensaje um
      ON um.ticket_id = t.id
      AND um.fila = 1

    WHERE 1 = 1
  `;

  const params = [];

  sql += filtroVisibilidad(usuario, params);

  if (estado) {
    sql += ` AND t.estado = @param${params.length}`;
    params.push(estado);
  }

  if (prioridad) {
    sql += ` AND t.prioridad = @param${params.length}`;
    params.push(prioridad);
  }

  if (buscar) {
    sql += `
      AND (
        u.nombre LIKE @param${params.length}
        OR t.asunto LIKE @param${params.length}
      )
    `;

    params.push(`%${buscar}%`);
  }

  if (orden === "antiguos") {
    sql += ` ORDER BY t.fecha_creacion ASC`;
  } else if (orden === "prioridad") {
    sql += `
      ORDER BY
        CASE
          WHEN t.prioridad = 'Alta' THEN 1
          WHEN t.prioridad = 'Media' THEN 2
          WHEN t.prioridad = 'Baja' THEN 3
          ELSE 4
        END,
        t.fecha_creacion DESC
    `;
  } else {
    sql += ` ORDER BY t.fecha_creacion DESC`;
  }

  return await query(sql, params);
};

// ======================================
// CREAR TICKET
// ======================================

export const crearTicket = async (usuarioId, datos) => {
  const {
    asunto,
    descripcion,
    categoria = null,
    prioridad = "Media",
  } = datos;

  if (!asunto?.trim()) {
    throw new Error("El asunto es obligatorio.");
  }

  if (!descripcion?.trim()) {
    throw new Error("La descripción es obligatoria.");
  }

  const cliente = await query(
    `
      SELECT id
      FROM clientes
      WHERE usuario_id = @param0
    `,
    [usuarioId]
  );

  if (!cliente.length) {
    throw new Error("Cliente no encontrado.");
  }

  const resultado = await query(
    `
      INSERT INTO tickets
      (
        cliente_id,
        asunto,
        descripcion,
        categoria,
        prioridad,
        estado
      )
      OUTPUT INSERTED.id AS id
      VALUES
      (
        @param0,
        @param1,
        @param2,
        @param3,
        @param4,
        'Pendiente'
      )
    `,
    [
      cliente[0].id,
      asunto.trim(),
      descripcion.trim(),
      categoria,
      prioridad,
    ]
  );

  const ticketId = resultado[0]?.id;

  if (!ticketId) {
    throw new Error("No se pudo crear el ticket.");
  }

  await query(
    `
      INSERT INTO ticket_historial
      (
        ticket_id,
        usuario_id,
        accion,
        fecha
      )
      VALUES
      (
        @param0,
        @param1,
        'Ticket creado',
        GETDATE()
      )
    `,
    [ticketId, usuarioId]
  );

  return ticketId;
};

// ======================================
// DASHBOARD
// ======================================

export const obtenerDashboard = async () => {
  const rows = await query(`
    WITH UltimoMensaje AS (
      SELECT
        tm.ticket_id,
        tm.fecha AS ultima_actividad,
        u.rol AS ultimo_rol,
        ROW_NUMBER() OVER (
          PARTITION BY tm.ticket_id
          ORDER BY tm.fecha DESC, tm.id DESC
        ) AS fila
      FROM ticket_mensajes tm
      INNER JOIN usuarios u
        ON u.id = tm.usuario_id
    )

    SELECT
      COUNT(*) AS total,

      SUM(
        CASE
          WHEN t.estado IN ('Pendiente', 'Abierto')
          THEN 1
          ELSE 0
        END
      ) AS pendientes,

      SUM(
        CASE
          WHEN t.estado = 'En proceso'
          THEN 1
          ELSE 0
        END
      ) AS proceso,

      SUM(
        CASE
          WHEN t.estado = 'Respondido'
          THEN 1
          ELSE 0
        END
      ) AS respondidos,

      SUM(
        CASE
          WHEN t.estado = 'Resuelto'
          THEN 1
          ELSE 0
        END
      ) AS resueltos,

      SUM(
        CASE
          WHEN t.estado = 'Cerrado'
          THEN 1
          ELSE 0
        END
      ) AS cerrados,

      SUM(
        CASE
          WHEN t.prioridad = 'Alta'
          THEN 1
          ELSE 0
        END
      ) AS prioridadAlta,

      SUM(
        CASE
          WHEN t.tecnico_id IS NULL
          THEN 1
          ELSE 0
        END
      ) AS sinAsignar,

      SUM(
        CASE
          WHEN t.estado NOT IN ('Resuelto', 'Cerrado')
            AND um.ultimo_rol = 'cliente'
          THEN 1
          ELSE 0
        END
      ) AS pendientesRespuesta

    FROM tickets t

    LEFT JOIN UltimoMensaje um
      ON um.ticket_id = t.id
      AND um.fila = 1
  `);

  return rows[0] || {
    total: 0,
    pendientes: 0,
    proceso: 0,
    respondidos: 0,
    resueltos: 0,
    cerrados: 0,
    prioridadAlta: 0,
    sinAsignar: 0,
    pendientesRespuesta: 0,
  };
};

// ======================================
// OBTENER TICKET POR ID
// ======================================

export const obtenerTicketPorId = async (id, usuario) => {
  const params = [id];

  const visibilidad = filtroVisibilidad(
    usuario,
    params
  );

  const rows = await query(
    `
      SELECT
        t.id,
        t.cliente_id,
        t.asunto,
        t.descripcion,
        t.categoria,
        t.prioridad,
        t.estado,
        t.tecnico_id,
        t.fecha_creacion,
        t.fecha_actualizacion,

        u.nombre AS cliente,
        u.correo,
        u.telefono,

        tecnico.nombre AS tecnico

      FROM tickets t

      INNER JOIN clientes c
        ON c.id = t.cliente_id

      INNER JOIN usuarios u
        ON u.id = c.usuario_id

      LEFT JOIN usuarios tecnico
        ON tecnico.id = t.tecnico_id

      WHERE t.id = @param0
      ${visibilidad}
    `,
    params
  );

  return rows[0] || null;
};

// ======================================
// ACTUALIZAR TICKET
// ======================================

export const actualizarTicket = async (
  id,
  usuarioId,
  datos
) => {
  const ticket = await obtenerTicketPorId(
    id,
    { rol: "admin" }
  );

  if (!ticket) {
    throw new Error("Ticket no encontrado.");
  }

  const estado =
    datos.estado ?? ticket.estado;

  const prioridad =
    datos.prioridad ?? ticket.prioridad;

  const tecnicoId =
    datos.tecnico_id ??
    ticket.tecnico_id ??
    null;

  const estadosValidos = [
    "Pendiente",
    "En proceso",
    "Respondido",
    "Resuelto",
    "Cerrado",
  ];

  const prioridadesValidas = [
    "Baja",
    "Media",
    "Alta",
  ];

  if (
    !estadosValidos.includes(estado) ||
    !prioridadesValidas.includes(prioridad)
  ) {
    throw new Error(
      "El estado o la prioridad no son válidos."
    );
  }

  await query(
    `
      UPDATE tickets
      SET
        estado = @param0,
        prioridad = @param1,
        tecnico_id = @param2,
        fecha_actualizacion = GETDATE(),
        fecha_cierre =
          CASE
            WHEN @param0 = 'Cerrado'
            THEN GETDATE()
            ELSE NULL
          END
      WHERE id = @param3
    `,
    [
      estado,
      prioridad,
      tecnicoId,
      id,
    ]
  );

  await query(
    `
      INSERT INTO ticket_historial
      (
        ticket_id,
        usuario_id,
        accion,
        fecha
      )
      VALUES
      (
        @param0,
        @param1,
        @param2,
        GETDATE()
      )
    `,
    [
      id,
      usuarioId,
      `Ticket actualizado. Estado: ${estado}, Prioridad: ${prioridad}`,
    ]
  );

  return true;
};

// ======================================
// ELIMINAR TICKET
// ======================================

export const eliminarTicket = async (
  id,
  usuarioId
) => {
  const ticket = await obtenerTicketPorId(
    id,
    { rol: "admin" }
  );

  if (!ticket) {
    throw new Error("Ticket no encontrado.");
  }

  await query(
    `
      DELETE FROM ticket_mensajes
      WHERE ticket_id = @param0
    `,
    [id]
  );

  await query(
    `
      DELETE FROM ticket_historial
      WHERE ticket_id = @param0
    `,
    [id]
  );

  await query(
    `
      DELETE FROM tickets
      WHERE id = @param0
    `,
    [id]
  );

  return true;
};

// ======================================
// OBTENER MENSAJES
// ======================================

export const obtenerMensajes = async (
  ticketId,
  usuario
) => {
  const ticket = await obtenerTicketPorId(
    ticketId,
    usuario
  );

  if (!ticket) {
    throw new Error(
      "No tienes acceso a este ticket."
    );
  }

  return await query(
    `
      SELECT
        tm.id,
        tm.ticket_id,
        tm.usuario_id,
        tm.mensaje,
        tm.fecha,

        u.nombre AS usuario,
        u.rol AS tipo

      FROM ticket_mensajes tm

      INNER JOIN usuarios u
        ON u.id = tm.usuario_id

      WHERE tm.ticket_id = @param0

      ORDER BY tm.fecha ASC
    `,
    [ticketId]
  );
};

// ======================================
// CREAR MENSAJE
// ======================================

export const crearMensaje = async (
  ticketId,
  usuario,
  datos
) => {
  const mensaje = datos.mensaje?.trim();

  if (!mensaje) {
    throw new Error(
      "El mensaje no puede estar vacío."
    );
  }

  const ticket = await obtenerTicketPorId(
    ticketId,
    usuario
  );

  if (!ticket) {
    throw new Error("Ticket no encontrado.");
  }

  if (
    usuario.rol === "cliente" &&
    ticket.estado === "Cerrado"
  ) {
    throw new Error(
      "No puedes responder un ticket cerrado."
    );
  }

  const operaciones = [
    query(
      `
        INSERT INTO ticket_mensajes
        (
          ticket_id,
          usuario_id,
          mensaje
        )
        VALUES
        (
          @param0,
          @param1,
          @param2
        )
      `,
      [
        ticketId,
        usuario.id,
        mensaje,
      ]
    ),

    query(
      `
        INSERT INTO ticket_historial
        (
          ticket_id,
          usuario_id,
          accion,
          fecha
        )
        VALUES
        (
          @param0,
          @param1,
          'Nuevo mensaje',
          GETDATE()
        )
      `,
      [
        ticketId,
        usuario.id,
      ]
    ),
  ];

  if (
    usuario.rol === "cliente" &&
    ticket.estado === "Respondido"
  ) {
    operaciones.push(
      query(
        `
          UPDATE tickets
          SET
            estado = 'Pendiente',
            fecha_actualizacion = GETDATE()
          WHERE id = @param0
        `,
        [ticketId]
      )
    );
  }

  if (
    ["admin", "tecnico"].includes(usuario.rol) &&
    !["Resuelto", "Cerrado"].includes(ticket.estado)
  ) {
    operaciones.push(
      query(
        `
          UPDATE tickets
          SET
            estado = 'Respondido',
            fecha_actualizacion = GETDATE()
          WHERE id = @param0
        `,
        [ticketId]
      )
    );
  }

  // Las operaciones son independientes entre sí (insertan/actualizan
  // filas distintas), así que se ejecutan en paralelo para no sumar
  // round-trips secuenciales hacia Azure.
  await Promise.all(operaciones);

  return true;
};

// ======================================
// OBTENER HISTORIAL
// ======================================

export const obtenerHistorial = async (
  ticketId,
  usuario
) => {
  const ticket = await obtenerTicketPorId(
    ticketId,
    usuario
  );

  if (!ticket) {
    throw new Error(
      "No tienes acceso a este ticket."
    );
  }

  return await query(
    `
      SELECT
        h.id,
        h.ticket_id,
        h.usuario_id,
        h.accion,
        h.fecha,

        u.nombre AS usuario

      FROM ticket_historial h

      INNER JOIN usuarios u
        ON u.id = h.usuario_id

      WHERE h.ticket_id = @param0

      ORDER BY h.fecha DESC
    `,
    [ticketId]
  );
};

// ======================================
// OBTENER TÉCNICOS
// ======================================

export const obtenerTecnicos = async () => {
  return await query(
    `
      SELECT
        id,
        nombre
      FROM usuarios
      WHERE rol = 'tecnico'
      ORDER BY nombre ASC
    `
  );
};