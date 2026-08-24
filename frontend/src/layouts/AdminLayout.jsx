import { useEffect, useRef, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import IdleTimer from '../components/security/IdleTimer.jsx';
import { useNotificaciones } from '../hooks/useNotificaciones.js';
import NotificationBell from '../components/Notificaciones/NotificationBell.jsx';
import NuevasNoticiasModal from '../components/Notificaciones/NuevasNoticiasModal.jsx';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const notif = useNotificaciones();

  const [modalAbierto, setModalAbierto] = useState(false);
  const yaMostrado = useRef(false);

  useEffect(() => {
    if (notif.noLeidas > 0 && !yaMostrado.current) {
      yaMostrado.current = true;
      setModalAbierto(true);
    }
  }, [notif.noLeidas]);

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

      {/* NOTIFICACIONES */}
      <NotificationBell
        notificaciones={notif.notificaciones}
        noLeidas={notif.noLeidas}
        marcarLeida={notif.marcarLeida}
        marcarTodas={notif.marcarTodas}
      />

      <NuevasNoticiasModal
        open={modalAbierto}
        notificaciones={notif.notificaciones}
        marcarLeida={notif.marcarLeida}
        marcarTodas={() => {
          notif.marcarTodas();
          setModalAbierto(false);
        }}
        onClose={() => setModalAbierto(false)}
      />

    </div>
  );
};

export default AdminLayout;