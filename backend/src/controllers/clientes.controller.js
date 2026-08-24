import { query } from "../config/db.js";
import bcrypt from "bcryptjs";

// ======================================
// OBTENER TODOS LOS CLIENTES
// ======================================
export const getClientes = async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        c.id,
        c.usuario_id,
        c.plan_id,
        c.zona_id,
        c.codigo_contrato,
        u.nombre,
        u.correo,
        u.telefono,
        c.direccion,
        c.estado,
        p.nombre AS nombre_plan,
        z.nombre AS nombre_zona,
        c.fecha_instalacion
      FROM clientes c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN planes p ON c.plan_id = p.id
      LEFT JOIN zonas z ON c.zona_id = z.id
      ORDER BY c.id DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

// ======================================
// OBTENER CLIENTE POR ID
// ======================================
export const getClienteById = async (req, res) => {
  const { id } = req.params;

  try {

    const params = [id];
    const filtroPropietario =
      req.user.rol === "cliente"
        ? " AND c.usuario_id = @param1"
        : "";

    if (filtroPropietario) {
      params.push(req.user.id);
    }

    const rows = await query(
      `
      SELECT
        c.id,
        c.usuario_id,
        c.plan_id,
        c.zona_id,
        c.codigo_contrato,
        c.direccion,
        c.estado,
        u.nombre,
        u.correo,
        u.telefono,
        p.nombre AS nombre_plan,
        z.nombre AS zona_nombre
      FROM clientes c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN planes p ON c.plan_id = p.id
      LEFT JOIN zonas z ON c.zona_id = z.id
      WHERE c.id = @param0
      ${filtroPropietario}
      `,
      params
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================
// SERVICIO DEL CLIENTE LOGUEADO
// ======================================
export const getMiServicio = async (req, res) => {

  const usuarioId = req.user.id;

  try {

    const rows = await query(
      `
      SELECT
        c.*,
        u.nombre,
        u.correo,
        u.telefono,
        p.nombre AS plan_nombre,
        p.velocidad,
        p.precio,
        z.nombre AS zona_nombre
      FROM clientes c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      LEFT JOIN planes p ON c.plan_id = p.id
      LEFT JOIN zonas z ON c.zona_id = z.id
      WHERE c.usuario_id = @param0
      `,
      [usuarioId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "No tienes servicio activo",
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================
// CREAR CLIENTE
// ======================================
export const createCliente = async (req, res) => {

  const {
    usuario_id,
    plan_id,
    zona_id,
    direccion,
  } = req.body;

  const codigo = `WC-${Date.now()}`;

  try {

    await query(
      `
      INSERT INTO clientes
      (
        usuario_id,
        plan_id,
        zona_id,
        codigo_contrato,
        direccion,
        estado,
        fecha_instalacion
      )
      VALUES
      (
        @param0,
        @param1,
        @param2,
        @param3,
        @param4,
        'activo',
        GETDATE()
      )
      `,
      [
        usuario_id,
        plan_id,
        zona_id,
        codigo,
        direccion,
      ]
    );

    res.status(201).json({
      message: "Cliente creado correctamente",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error al crear cliente",
      error: error.message,
    });
  }
};

// ======================================
// ACTUALIZAR CLIENTE
// ======================================
export const updateCliente = async (req, res) => {

  const { id } = req.params;

  const {
    usuario_id,
    nombre,
    correo,
    telefono,
    plan_id,
    zona_id,
    direccion,
    estado,
  } = req.body;

  try {

    // Actualizar usuario
    await query(
      `
      UPDATE usuarios
      SET
        nombre = @param0,
        correo = @param1,
        telefono = @param2
      WHERE id = @param3
      `,
      [
        nombre,
        correo,
        telefono,
        usuario_id,
      ]
    );

    // Actualizar cliente
    await query(
      `
      UPDATE clientes
      SET
        plan_id = @param0,
        zona_id = @param1,
        direccion = @param2,
        estado = @param3
      WHERE id = @param4
      `,
      [
        plan_id,
        zona_id,
        direccion,
        estado,
        id,
      ]
    );

    res.json({
      message: "Cliente actualizado correctamente",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error al actualizar cliente",
      error: error.message,
    });
  }
};

// ======================================
// SUSPENDER CLIENTE
// ======================================
export const deleteCliente = async (req, res) => {

  const { id } = req.params;

  try {

    await query(
      `
      UPDATE clientes
      SET estado = 'suspendido'
      WHERE id = @param0
      `,
      [id]
    );

    res.json({
      message: "Cliente suspendido correctamente",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error al suspender cliente",
      error: error.message,
    });
  }
};
// ======================================
// ACTUALIZAR FECHA DE INSTALACIÓN
// ======================================

export const actualizarFechaInstalacion = async (req, res) => {

  const { id } = req.params;

  const {
    fecha_instalacion,
    password,
    motivo
  } = req.body;

  try {

    // Validar motivo

    if (!motivo || motivo.trim().length < 10) {

      return res.status(400).json({
        message: "Debe ingresar un motivo de mínimo 10 caracteres."
      });

    }

    // Buscar administrador

    const admin = await query(
      `
      SELECT
        id,
        contraseña
      FROM usuarios
      WHERE id = @param0
      `,
      [
        req.user.id
      ]
    );

    if (!admin.length) {

      return res.status(404).json({
        message: "Administrador no encontrado."
      });

    }

    // Verificar contraseña

    const passwordCorrecta = await bcrypt.compare(
      password,
      admin[0].contraseña
    );

    if (!passwordCorrecta) {

      return res.status(401).json({
        message: "La contraseña del administrador es incorrecta."
      });

    }

    // Buscar cliente

    const cliente = await query(
      `
      SELECT
        fecha_instalacion
      FROM clientes
      WHERE id = @param0
      `,
      [
        id
      ]
    );

    if (!cliente.length) {

      return res.status(404).json({
        message: "Cliente no encontrado."
      });

    }

    const fechaAnterior = cliente[0].fecha_instalacion;

    // Actualizar fecha

    await query(
      `
      UPDATE clientes
      SET fecha_instalacion = @param0
      WHERE id = @param1
      `,
      [
        fecha_instalacion,
        id
      ]
    );

    // Registrar auditoría

    await query(
      `
      INSERT INTO auditoria_clientes
      (
        cliente_id,
        administrador_id,
        campo,
        valor_anterior,
        valor_nuevo,
        motivo
      )
      VALUES
      (
        @param0,
        @param1,
        @param2,
        @param3,
        @param4,
        @param5
      )
      `,
      [
        id,
        req.user.id,
        "fecha_instalacion",
        fechaAnterior,
        fecha_instalacion,
        motivo
      ]
    );

    res.json({
      message: "Fecha de instalación actualizada correctamente."
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }

};