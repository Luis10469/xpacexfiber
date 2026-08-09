import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import IdleTimer from '../components/security/IdleTimer.jsx';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white text-lg">
          Cargando...
        </p>
      </div>
    );
  }

  if (!user || user.rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* SIDEBAR */}
      <Sidebar rol="admin" />

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="
          min-h-screen
          min-w-0
          w-full
          box-border
          overflow-x-hidden

          px-4
          pt-24
          pb-6

          lg:ml-[360px]
          lg:w-[calc(100%-360px)]
          lg:px-8
          lg:pt-8
          lg:pb-8
        "
      >
        <div className="w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* SEGURIDAD */}
      <IdleTimer />

    </div>
  );
};

export default AdminLayout;