import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  return new Date(fecha).toLocaleString("es-CO");
};

const NotificationBell = ({ notificaciones, noLeidas, marcarLeida, marcarTodas }) => {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    const alClickearFuera = (e) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target)
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", alClickearFuera);

    return () =>
      document.removeEventListener("mousedown", alClickearFuera);
  }, []);

  return (
    <div ref={contenedorRef} className="fixed top-4 right-4 z-[60]">

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-blue-600
          text-white
          shadow-lg
          transition
          hover:bg-blue-700
        "
        aria-label="Notificaciones"
      >
        <Bell size={22} />

        {noLeidas > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-xs
              font-bold
              text-white
            "
          >
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-[90vw]
            max-w-96
            max-h-[70vh]
            overflow-y-auto
            rounded-2xl
            border
            border-slate-700
            bg-slate-800
            shadow-2xl
          "
        >

          <div className="flex items-center justify-between border-b border-slate-700 p-4">
            <h3 className="font-bold text-white">Notificaciones</h3>

            {noLeidas > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {notificaciones.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">
              No tienes notificaciones.
            </p>
          ) : (
            <div className="divide-y divide-slate-700">
              {notificaciones.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => !n.leido && marcarLeida(n.id)}
                  className={`
                    block
                    w-full
                    p-4
                    text-left
                    transition
                    hover:bg-slate-700
                    ${!n.leido ? "bg-blue-900/20" : ""}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">
                      {n.titulo}
                    </p>

                    {!n.leido && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                    {n.mensaje}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {formatearFecha(n.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default NotificationBell;
