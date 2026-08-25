import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PublicLayout from './layouts/PublicLayout.jsx';
import ClienteLayout from './layouts/ClienteLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Usuarios from './pages/admin/Usuarios.jsx';
import Inicio from './pages/public/Inicio.jsx';
import Cobertura from './pages/public/Cobertura.jsx';
import Planes from './pages/public/Planes.jsx';
import Contacto from './pages/public/Contacto.jsx';
import FAQ from './pages/public/FAQ.jsx';
import Login from './pages/public/Login.jsx';
import Registro from './pages/public/Registro.jsx';
import LoginLogs from "./pages/admin/LoginLogs";
import Dashboard from './pages/cliente/Dashboard.jsx';
import MiServicio from './pages/cliente/MiServicio.jsx';
import Facturas from './pages/cliente/Facturas.jsx';
import Tickets from './pages/cliente/Tickets.jsx';
import Perfil from './pages/cliente/Perfil.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Clientes from './pages/admin/Clientes.jsx';
import PlanesAdmin from './pages/admin/Planes.jsx';
import Zonas from './pages/admin/Zonas.jsx';
import AdminTickets from './pages/admin/Tickets.jsx';
import Noticias from './pages/admin/Noticias.jsx';
import Reportes from './pages/admin/Reportes.jsx';
import Facturacion from './pages/admin/Facturacion.jsx';
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
