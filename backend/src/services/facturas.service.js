import { query } from "../config/db.js";

// ======================================
// VALIDACIÓN
// ======================================

const ESTADOS_VALIDOS = ["pendiente", "pagada", "vencida", "anulada"];

class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ======================================
// PERMISOS
// ======================================

const puedeGestionarFacturas = (usuario) => usuario?.rol === "admin";

const filtroPropietarioFactura = (usuario, params) => {
  if (puedeGestionarFacturas(usuario)) return "";

  params.push(usuario?.id);

  return ` AND c.usuario_id = @param${params.length - 1}`;
};

// ======================================
// CREAR / PUBLICAR FACTURA
// ======================================

export const crearFactura = async (adminId, datos) => {
  const {
    cliente_id,
    plan_id,
    monto,
    periodo,
    concepto,
    fecha_emision,
    fecha_vencimiento,
    estado = "pendiente",
    forzar = false,
  } = datos;

  const clienteId = Number(cliente_id);

  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    throw new ServiceError(400, "Debe seleccionar un cliente válido.");
  }

  const montoNumerico = Number(monto);

  if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
    throw new ServiceError(400, "El valor de la factura debe ser mayor a 0.");
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new ServiceError(400, "El estado de la factura no es válido.");
  }

  if (!fecha_emision) {
    throw new ServiceError(400, "La fecha de emisión es obligatoria.");
  }

  // Confirmar que el cliente existe y obtener el usuario dueño (para
  // la notificación).
  const clientes = await query(
    `
    SELECT
      c.id AS cliente_id,
      u.id AS usuario_id,
      u.nombre,
      u.correo
    FROM clientes c
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = @param0
    `,
    [clienteId]
  );

  if (!clientes.length) {
    throw new ServiceError(404, "Cliente no encontrado.");
  }

  const cliente = clientes[0];

  // Evitar facturas duplicadas: mismo cliente + mismo periodo. Es un
  // chequeo a nivel aplicación (no un UNIQUE en SQL) para poder permitir
  // que el admin confirme explícitamente y la cree igual (forzar=true) —
  // un UNIQUE constraint bloquearía ese flujo por completo.
  if (periodo) {
    const duplicadas = await query(
      `SELECT id, numero FROM facturas WHERE cliente_id = @param0 AND periodo = @param1`,
      [clienteId, periodo]
    );

    if (duplicadas.length && !forzar) {
      throw new ServiceError(
        409,
        `Ya existe la factura ${duplicadas[0].numero} para este cliente durante ${periodo}.`
      );
    }
  }

  // Insertar la factura.
  const insertados = await query(
    `
    INSERT INTO facturas
    (
      cliente_id,
      plan_id,
      monto,
      fecha_emision,
      fecha_vencimiento,
      periodo,
      concepto,
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
      @param5,
      @param6,
      @param7
    )
    `,
    [
      clienteId,
      plan_id || null,
      montoNumerico,
      fecha_emision,
      fecha_vencimiento || null,
      periodo || null,
      concepto || null,
      estado,
    ]
  );

  const facturaId = insertados[0]?.id;

  if (!facturaId) {
    throw new ServiceError(500, "No se pudo crear la factura.");
  }

  // Generar el número de factura a partir del id real.
  const actualizadas = await query(
    `
    UPDATE facturas
    SET numero = 'FAC-' + RIGHT('00000' + CAST(id AS VARCHAR(10)), 5)
    OUTPUT INSERTED.*
    WHERE id = @param0
    `,
    [facturaId]
  );

  const factura = actualizadas[0];

  // Crear la notificación para el cliente, reutilizando la tabla
  // notificaciones existente (sin noticia_id, igual que otras
  // notificaciones puntuales).
  const montoFormateado = montoNumerico.toLocaleString("es-CO");
  const periodoTexto = periodo ? ` correspondiente a ${periodo}` : "";

  await query(
    `
    INSERT INTO notificaciones
    (
      usuario_id,
      noticia_id,
      titulo,
      mensaje
    )
    VALUES
    (
      @param0,
      NULL,
      @param1,
      @param2
    )
    `,
    [
      cliente.usuario_id,
      "Nueva factura disponible",
      `Tu factura ${factura.numero}${periodoTexto} ya está disponible por $${montoFormateado}.`,
    ]
  );

  return {
    factura,
    cliente: {
      nombre: cliente.nombre,
      correo: cliente.correo,
    },
  };
};

// ======================================
// LISTAR FACTURAS (ADMIN)
// ======================================

export const obtenerFacturas = async (filtros = {}) => {
  const { estado, periodo, buscar } = filtros;

  const params = [];

  let sql = `
    SELECT
      f.id,
      f.numero,
      f.cliente_id,
      f.monto,
      f.periodo,
      f.concepto,
      f.fecha_emision,
      f.fecha_vencimiento,
      f.estado,
      f.created_at,
      u.nombre AS cliente_nombre,
      u.correo AS cliente_correo,
      c.codigo_contrato
    FROM facturas f
    INNER JOIN clientes c ON c.id = f.cliente_id
    INNER JOIN usuarios u ON u.id = c.usuario_id
    WHERE 1 = 1
  `;

  if (estado) {
    sql += ` AND f.estado = @param${params.length}`;
    params.push(estado);
  }

  if (periodo) {
    sql += ` AND f.periodo LIKE @param${params.length}`;
    params.push(`%${periodo}%`);
  }

  if (buscar) {
    sql += `
      AND (
        u.nombre LIKE @param${params.length}
        OR u.correo LIKE @param${params.length}
        OR f.numero LIKE @param${params.length}
      )
    `;
    params.push(`%${buscar}%`);
  }

  sql += ` ORDER BY f.id DESC`;

  return await query(sql, params);
};

// ======================================
// FACTURA POR ID (ADMIN O DUEÑO)
// ======================================

export const obtenerFacturaPorId = async (id, usuario) => {
  const params = [id];

  const visibilidad = filtroPropietarioFactura(usuario, params);

  const rows = await query(
    `
    SELECT
      f.id,
      f.numero,
      f.cliente_id,
      f.monto,
      f.periodo,
      f.concepto,
      f.fecha_emision,
      f.fecha_vencimiento,
      f.estado,
      f.created_at,
      u.nombre AS cliente_nombre,
      u.correo AS cliente_correo,
      c.direccion AS cliente_direccion,
      c.codigo_contrato,
      p.nombre AS plan_nombre
    FROM facturas f
    INNER JOIN clientes c ON c.id = f.cliente_id
    INNER JOIN usuarios u ON u.id = c.usuario_id
    LEFT JOIN planes p ON p.id = c.plan_id
    WHERE f.id = @param0
    ${visibilidad}
    `,
    params
  );

  if (!rows.length) {
    throw new ServiceError(404, "Factura no encontrada.");
  }

  return rows[0];
};

// ======================================
// ACTUALIZAR ESTADO (ADMIN)
// ======================================

export const actualizarEstadoFactura = async (id, nuevoEstado) => {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new ServiceError(400, "El estado de la factura no es válido.");
  }

  const actualizadas = await query(
    `
    UPDATE facturas
    SET
      estado = @param0,
      updated_at = GETDATE()
    OUTPUT INSERTED.*
    WHERE id = @param1
    `,
    [nuevoEstado, id]
  );

  if (!actualizadas.length) {
    throw new ServiceError(404, "Factura no encontrada.");
  }

  return actualizadas[0];
};

// ======================================
// MIS FACTURAS (CLIENTE)
// ======================================

export const obtenerMisFacturas = async (usuario, filtros = {}) => {
  const { estado } = filtros;

  const params = [usuario.id];

  let sql = `
    SELECT
      f.id,
      f.numero,
      f.monto,
      f.periodo,
      f.concepto,
      f.fecha_emision,
      f.fecha_vencimiento,
      f.estado
    FROM facturas f
    INNER JOIN clientes c ON c.id = f.cliente_id
    WHERE c.usuario_id = @param0
  `;

  if (estado) {
    sql += ` AND f.estado = @param${params.length}`;
    params.push(estado);
  }

  sql += ` ORDER BY f.fecha_emision DESC, f.id DESC`;

  return await query(sql, params);
};
