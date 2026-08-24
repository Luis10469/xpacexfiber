import { query } from "../config/db.js";

const MESES_VALIDOS = [3, 6, 12];
const TICKETS_ABIERTOS = ["Pendiente", "En proceso", "Respondido"];

// ======================================
// NORMALIZACIÓN DE FILTROS
// ======================================

const normalizarFiltros = (filtros = {}) => {
  const zonaId = Number(filtros.zona_id);
  const planId = Number(filtros.plan_id);
  const meses = Number(filtros.meses);

  return {
    zonaId: Number.isInteger(zonaId) && zonaId > 0 ? zonaId : null,
    planId: Number.isInteger(planId) && planId > 0 ? planId : null,
    meses: MESES_VALIDOS.includes(meses) ? meses : 6,
  };
};

// ======================================
// UTILIDAD: ÚLTIMOS N MESES (yyyy-MM) Y RELLENO EN CERO
// ======================================

const ultimosMeses = (n) => {
  const etiquetas = [];
  const hoy = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const etiqueta = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    etiquetas.push(etiqueta);
  }

  return etiquetas;
};

const rellenarSerie = (etiquetas, filas) => {
  const mapa = new Map(filas.map((f) => [f.periodo, Number(f.total) || 0]));

  return etiquetas.map((periodo) => ({
    periodo,
    total: mapa.get(periodo) || 0,
  }));
};

// ======================================
// REPORTES
// ======================================

export const obtenerReportes = async (filtrosCrudos = {}) => {
  const { zonaId, planId, meses } = normalizarFiltros(filtrosCrudos);
  const etiquetas = ultimosMeses(meses);

  const [
    clientesActivos,
    ingresosMes,
    ticketsAbiertos,
    zonasCubiertas,
    ingresosMensualesRaw,
    clientesPorZona,
    ticketsPorEstado,
    planesMasContratados,
    crecimientoClientesRaw,
  ] = await Promise.all([
    obtenerClientesActivos(zonaId, planId),
    obtenerIngresosMes(zonaId, planId),
    obtenerTicketsAbiertos(zonaId, planId),
    obtenerZonasCubiertas(planId),
    obtenerIngresosMensuales(zonaId, planId, meses),
    obtenerClientesPorZona(planId),
    obtenerTicketsPorEstado(zonaId, planId),
    obtenerPlanesMasContratados(zonaId),
    obtenerCrecimientoClientes(zonaId, planId, meses),
  ]);

  return {
    resumen: {
      clientesActivos,
      ingresosMes,
      ticketsAbiertos,
      zonasCubiertas,
    },
    ingresosMensuales: rellenarSerie(etiquetas, ingresosMensualesRaw),
    clientesPorZona,
    ticketsPorEstado,
    planesMasContratados,
    crecimientoClientes: rellenarSerie(etiquetas, crecimientoClientesRaw),
  };
};

// ======================================
// CLIENTES ACTIVOS
// ======================================

const obtenerClientesActivos = async (zonaId, planId) => {
  const params = [];

  let sql = `SELECT COUNT(*) AS total FROM clientes WHERE estado = 'activo'`;

  if (zonaId) {
    sql += ` AND zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND plan_id = @param${params.length}`;
    params.push(planId);
  }

  const rows = await query(sql, params);

  return Number(rows[0]?.total) || 0;
};

// ======================================
// INGRESOS DEL MES ACTUAL
// ======================================

const obtenerIngresosMes = async (zonaId, planId) => {
  const params = [];
  const conFiltro = Boolean(zonaId || planId);

  let sql = `
    SELECT ISNULL(SUM(f.monto), 0) AS total
    FROM facturas f
    ${conFiltro ? "INNER JOIN clientes c ON c.id = f.cliente_id" : ""}
    WHERE f.estado = 'pagada'
      AND YEAR(f.fecha_emision) = YEAR(GETDATE())
      AND MONTH(f.fecha_emision) = MONTH(GETDATE())
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  const rows = await query(sql, params);

  return Number(rows[0]?.total) || 0;
};

// ======================================
// TICKETS ABIERTOS
// ======================================

const obtenerTicketsAbiertos = async (zonaId, planId) => {
  const params = TICKETS_ABIERTOS.slice();

  const placeholdersEstados = TICKETS_ABIERTOS.map(
    (_, i) => `@param${i}`
  ).join(", ");

  let sql = `
    SELECT COUNT(*) AS total
    FROM tickets t
    INNER JOIN clientes c ON c.id = t.cliente_id
    WHERE t.estado IN (${placeholdersEstados})
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  const rows = await query(sql, params);

  return Number(rows[0]?.total) || 0;
};

// ======================================
// ZONAS CUBIERTAS
// ======================================

const obtenerZonasCubiertas = async (planId) => {
  const params = [];

  let sql = `
    SELECT COUNT(DISTINCT z.id) AS total
    FROM zonas z
    INNER JOIN clientes c ON c.zona_id = z.id AND c.estado = 'activo'
    WHERE z.estado = 1
  `;

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  const rows = await query(sql, params);

  return Number(rows[0]?.total) || 0;
};

// ======================================
// INGRESOS MENSUALES (SERIE)
// ======================================

const obtenerIngresosMensuales = async (zonaId, planId, meses) => {
  const params = [meses];
  const conFiltro = Boolean(zonaId || planId);

  let sql = `
    SELECT
      FORMAT(f.fecha_emision, 'yyyy-MM') AS periodo,
      ISNULL(SUM(f.monto), 0) AS total
    FROM facturas f
    ${conFiltro ? "INNER JOIN clientes c ON c.id = f.cliente_id" : ""}
    WHERE f.estado = 'pagada'
      AND f.fecha_emision >= DATEADD(MONTH, -@param0, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  sql += ` GROUP BY FORMAT(f.fecha_emision, 'yyyy-MM') ORDER BY periodo`;

  return await query(sql, params);
};

// ======================================
// CLIENTES POR ZONA
// ======================================

const obtenerClientesPorZona = async (planId) => {
  const params = [];

  const filtroPlan = planId
    ? ` AND c.plan_id = @param${params.length}`
    : "";

  if (planId) params.push(planId);

  const sql = `
    SELECT z.nombre AS zona, COUNT(c.id) AS total
    FROM zonas z
    LEFT JOIN clientes c ON c.zona_id = z.id AND c.estado = 'activo' ${filtroPlan}
    WHERE z.estado = 1
    GROUP BY z.id, z.nombre
    ORDER BY z.nombre
  `;

  const rows = await query(sql, params);

  return rows.map((r) => ({ zona: r.zona, total: Number(r.total) || 0 }));
};

// ======================================
// TICKETS POR ESTADO
// ======================================

const obtenerTicketsPorEstado = async (zonaId, planId) => {
  const params = [];

  let sql = `
    SELECT t.estado, COUNT(*) AS total
    FROM tickets t
    INNER JOIN clientes c ON c.id = t.cliente_id
    WHERE 1 = 1
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  sql += ` GROUP BY t.estado ORDER BY total DESC`;

  const rows = await query(sql, params);

  return rows.map((r) => ({ estado: r.estado, total: Number(r.total) || 0 }));
};

// ======================================
// PLANES MÁS CONTRATADOS
// ======================================

const obtenerPlanesMasContratados = async (zonaId) => {
  const params = [];

  let sql = `
    SELECT TOP 10 p.nombre AS nombrePlan, COUNT(c.id) AS total
    FROM planes p
    INNER JOIN clientes c ON c.plan_id = p.id AND c.estado = 'activo'
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  sql += ` GROUP BY p.id, p.nombre HAVING COUNT(c.id) > 0 ORDER BY total DESC`;

  const rows = await query(sql, params);

  return rows.map((r) => ({ plan: r.nombrePlan, total: Number(r.total) || 0 }));
};

// ======================================
// CRECIMIENTO DE CLIENTES (NUEVOS POR MES)
// ======================================

const obtenerCrecimientoClientes = async (zonaId, planId, meses) => {
  const params = [meses];

  let sql = `
    SELECT
      FORMAT(c.fecha_instalacion, 'yyyy-MM') AS periodo,
      COUNT(*) AS total
    FROM clientes c
    WHERE c.fecha_instalacion >= DATEADD(MONTH, -@param0, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
  `;

  if (zonaId) {
    sql += ` AND c.zona_id = @param${params.length}`;
    params.push(zonaId);
  }

  if (planId) {
    sql += ` AND c.plan_id = @param${params.length}`;
    params.push(planId);
  }

  sql += ` GROUP BY FORMAT(c.fecha_instalacion, 'yyyy-MM') ORDER BY periodo`;

  return await query(sql, params);
};
