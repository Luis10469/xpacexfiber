import dotenv from "dotenv";

dotenv.config();

// ======================================
// CONFIGURACIÓN SQL SERVER
// ======================================
// Modo local (por defecto): conexión de Windows (Trusted_Connection) vía
// ODBC, igual que siempre. Requiere el driver nativo `msnodesqlv8`, que
// solo funciona en Windows.
//
// Modo nube (DB_TRUSTED_CONNECTION=false, ej. Render/Railway sobre
// Azure SQL Database): usuario/contraseña por TCP con el driver
// estándar `mssql` (sin dependencias nativas), que sí corre en Linux.
// El módulo nativo `msnodesqlv8` se importa de forma dinámica y solo en
// el modo local, para que nunca se intente cargar en un contenedor
// Linux donde no puede compilarse.

const modoNube = process.env.DB_TRUSTED_CONNECTION === "false";

const construirConfig = () => {
  if (modoNube) {
    return {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,

      pool: {
        max: 10,
        min: 1, // mantiene una conexión viva para evitar el reconnect (TLS) tras inactividad
        idleTimeoutMillis: 30000,
      },

      options: {
        encrypt: true, // obligatorio en Azure SQL Database
        trustServerCertificate: false,
        useUTC: false,
      },
    };
  }

  return {
    connectionString: [
      "Driver={ODBC Driver 18 for SQL Server}",
      `Server=${process.env.DB_HOST}`,
      `Database=${process.env.DB_NAME}`,
      "Trusted_Connection=Yes",
      "Encrypt=No",
      "TrustServerCertificate=Yes",
    ].join(";"),

    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },

    options: {
      trustedConnection: true,
      useUTC: false,
    },
  };
};

// ======================================
// POOL DE CONEXIÓN
// ======================================

let pool = null;

// ======================================
// CONECTAR BASE DE DATOS
// ======================================

export const connectDB = async () => {
  try {
    if (pool) {
      return pool;
    }

    const sql = modoNube
      ? (await import("mssql")).default
      : (await import("mssql/msnodesqlv8.js")).default;

    pool = await sql.connect(construirConfig());

    console.log("✅ SQL Server conectado correctamente");
    console.log(`📦 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🖥️ Servidor: ${process.env.DB_HOST}`);
    console.log(`🌐 Modo: ${modoNube ? "nube (SQL auth)" : "local (Windows)"}`);

    return pool;
  } catch (error) {
    console.error("❌ Error al conectar con SQL Server:");
    console.error(error);

    pool = null;
    throw error;
  }
};

// ======================================
// OBTENER POOL
// ======================================

export const getPool = async () => {
  if (!pool) {
    await connectDB();
  }

  return pool;
};

// ======================================
// EJECUTAR CONSULTAS
// ======================================

export const query = async (text, params = []) => {
  const connection = await getPool();
  const request = connection.request();

  params.forEach((param, index) => {
    request.input(`param${index}`, param);
  });

  let parameterizedQuery = text;

  params.forEach((_, index) => {
    parameterizedQuery = parameterizedQuery.replace(
      "?",
      `@param${index}`
    );
  });

  const result = await request.query(parameterizedQuery);

  return result.recordset;
};

// ======================================
// EXPORTACIÓN
// ======================================

export default pool;