import app from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

const iniciarServidor = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
  }
};

iniciarServidor();