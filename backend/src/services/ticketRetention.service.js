import { query } from "../config/db.js";

const RETENCION_DIAS = 7;
const INTERVALO_MS = 24 * 60 * 60 * 1000; // 24h

// ======================================
// LIMPIEZA DE MENSAJES ANTIGUOS
// ======================================
// Borra únicamente los mensajes de ticket_mensajes con más de
// RETENCION_DIAS de antigüedad. Nunca borra el ticket. Antes de borrar,
// guarda un resumen (cantidad total de mensajes y fecha del último) en
// la propia tabla tickets, para no perder trazabilidad.

export const ejecutarLimpiezaMensajes = async () => {
  const inicio = Date.now();

  // 1) Snapshot: para cada ticket con al menos un mensaje próximo a
  //    purgarse, guarda el total de mensajes y la fecha del último
  //    ANTES de borrar nada.
  await query(`
    UPDATE t
    SET
      mensajes_total = resumen.total,
      fecha_ultimo_mensaje = resumen.ultima_fecha
    FROM tickets t
    INNER JOIN (
      SELECT
        tm.ticket_id,
        COUNT(*) AS total,
        MAX(tm.fecha) AS ultima_fecha
      FROM ticket_mensajes tm
      GROUP BY tm.ticket_id
    ) AS resumen
      ON resumen.ticket_id = t.id
    WHERE EXISTS (
      SELECT 1
      FROM ticket_mensajes tm2
      WHERE tm2.ticket_id = t.id
        AND tm2.fecha < DATEADD(DAY, -${RETENCION_DIAS}, GETDATE())
    )
  `);

  // 2) Purga: elimina mensajes con más de RETENCION_DIAS días de
  //    antigüedad. Sentencia única, sin recorrer tickets uno por uno.
  await query(`
    DELETE FROM ticket_mensajes
    WHERE fecha < DATEADD(DAY, -${RETENCION_DIAS}, GETDATE())
  `);

  const duracionMs = Date.now() - inicio;

  console.log(
    `🧹 Limpieza de mensajes de tickets completada en ${duracionMs}ms (retención: ${RETENCION_DIAS} días).`
  );
};

// ======================================
// PROGRAMACIÓN
// ======================================
// Corre una vez al iniciar el servidor y luego cada 24h, mientras el
// proceso siga vivo. Un único setInterval, sin loops ni peticiones
// excesivas.

export const programarLimpiezaMensajes = () => {
  const ejecutarConManejoDeErrores = async () => {
    try {
      await ejecutarLimpiezaMensajes();
    } catch (error) {
      console.error("❌ Error en limpieza de mensajes de tickets:", error);
    }
  };

  ejecutarConManejoDeErrores();

  setInterval(ejecutarConManejoDeErrores, INTERVALO_MS);
};
