import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicLayout from './layouts/PublicLayout.jsx';
import ClienteLayout from './layouts/ClienteLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Usuarios from './pages/Admin/Usuarios.jsx';
import Inicio from './pages/public/Inicio.jsx';
import Cobertura from './pages/public/Cobertura.jsx';
import Planes from './pages/public/Planes.jsx';
import Contacto from './pages/public/Contacto.jsx';
import FAQ from './pages/public/FAQ.jsx';
import Login from './pages/public/Login.jsx';
import Registro from './pages/public/Registro.jsx';
import LoginLogs from "./pages/Admin/LoginLogs";
import Dashboard from './pages/Cliente/Dashboard.jsx';
import MiServicio from './pages/Cliente/MiServicio.jsx';
import Facturas from './pages/Cliente/Facturas.jsx';
import Tickets from './pages/Cliente/Tickets.jsx';
import Perfil from './pages/Cliente/Perfil.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import Clientes from './pages/Admin/Clientes.jsx';
import PlanesAdmin from './pages/Admin/Planes.jsx';
import Zonas from './pages/Admin/Zonas.jsx';
import AdminTickets from './pages/Admin/Tickets.jsx';
import Noticias from './pages/Admin/Noticias.jsx';
import Reportes from './pages/Admin/Reportes.jsx';
import Facturacion from './pages/Admin/Facturacion.jsx';
import ForgotPassword from './pages/Login/ForgotPassword.jsx';
import ResetPassword from './pages/Login/ResetPassword.jsx';
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rutas públicas */}
              <Route element={<PublicLayout />}>

              <Route path="/" element={<Inicio />} />
              <Route path="/cobertura" element={<Cobertura />} />
              <Route path="/planes" element={<Planes />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

            </Route>

        {/* Rutas cliente */}
        <Route path="/cliente" element={<ClienteLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="servicio" element={<MiServicio />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

        {/* Rutas admin */}
           <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="planes" element={<PlanesAdmin />} />
            <Route path="zonas" element={<Zonas />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="login-logs" element={<LoginLogs />}/>
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
