import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import planesRoutes from './routes/planes.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import zonasRoutes from "./routes/zonas.routes.js";
import loginLogsRoutes from "./routes/loginLogs.routes.js";
import noticiasRoutes from "./routes/noticias.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import facturasRoutes from "./routes/facturas.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/dashboard', dashboardRoutes);
// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use("/api/zonas", zonasRoutes);
app.use("/api/login-logs", loginLogsRoutes);
app.use("/api/noticias", noticiasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/facturas", facturasRoutes);
// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'API Spacex-fiber funcionando ✅' });
});

export default app;
