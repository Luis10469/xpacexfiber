import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const LoginLogs = () => {

  const [logs, setLogs] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [logSeleccionado, setLogSeleccionado] = useState(null);

  // ==========================
  // CARGAR HISTORIAL
  // ==========================

  const cargarLogs = async () => {

    try {

      const { data } = await api.get("/login-logs");

      setLogs(data);

    } catch (error) {

      console.error(error);

      toast.error("No se pudo cargar el historial.");

    }

  };

  useEffect(() => {

    cargarLogs();

  }, []);

  // ==========================
  // FILTRO
  // ==========================

  const hayBusqueda = busqueda.trim().length > 0;

  const haceMenosDe24h = (fecha) => {

    const veinticuatroHoras = 24 * 60 * 60 * 1000;

    return Date.now() - new Date(fecha).getTime() <= veinticuatroHoras;

  };

  // Sin búsqueda: solo últimas 24h.
  // Con búsqueda por correo: todo el historial, sin límite de fecha.
  const logsFiltrados = (
    hayBusqueda
      ? logs
      : logs.filter((log) => haceMenosDe24h(log.fecha))
  ).filter((log) =>

    log.correo
      .toLowerCase()
      .includes(busqueda.toLowerCase())

  );

  // ==========================
  // FORMATO FECHA
  // ==========================

  const formatearFecha = (fecha) => {

    return new Date(fecha).toLocaleString("es-CO");

  };

  const estadoBadgeClass = (estado) => {

    if (estado === "Exitoso") return "bg-green-500/20 text-green-400";
    if (estado === "Cuenta bloqueada") return "bg-yellow-500/20 text-yellow-400";

    return "bg-red-500/20 text-red-400";

  };

  return (

    <div className="h-screen bg-slate-900 p-8 text-white flex flex-col">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">

            Seguridad

          </p>

          <h1 className="text-5xl font-black mt-2">

            Historial de Accesos

          </h1>

          <p className="text-slate-400 mt-2">

            {hayBusqueda
              ? "Mostrando todo el historial que coincide con la búsqueda."
              : "Mostrando los accesos de las últimas 24 horas."}

          </p>

        </div>

        <span
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
            hayBusqueda
              ? "bg-blue-500/20 text-blue-400"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {hayBusqueda ? "Historial completo" : "Últimas 24h"}
        </span>

      </div>

      {/* ==========================
          TARJETAS
      ========================== */}

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">

          <p className="text-slate-400">

            Total registros

          </p>

          <h2 className="text-4xl font-bold mt-2">

            {logsFiltrados.length}

          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">

          <p className="text-green-400">

            Exitosos

          </p>

          <h2 className="text-4xl font-bold mt-2">

            {
              logsFiltrados.filter(
                log => log.estado === "Exitoso"
              ).length
            }

          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">

          <p className="text-red-400">

            Fallidos

          </p>

          <h2 className="text-4xl font-bold mt-2">

            {
              logsFiltrados.filter(
                log => log.estado !== "Exitoso"
              ).length
            }

          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">

          <p className="text-yellow-400">

            Bloqueos

          </p>

          <h2 className="text-4xl font-bold mt-2">

            {
              logsFiltrados.filter(
                log => log.estado === "Cuenta bloqueada"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* ==========================
          BUSCADOR
      ========================== */}

      <div className="mb-8">

        <input

          type="text"

          placeholder="🔍 Buscar por correo..."

          value={busqueda}

          onChange={(e) =>
            setBusqueda(e.target.value)
          }

          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-4
            outline-none
            focus:border-blue-500
          "

        />

        <p className="text-slate-500 text-sm mt-2">
          Al buscar por correo se muestra todo el historial, sin límite de 24 horas.
        </p>

</div>
      {/* ==========================
          TABLA
      ========================== */}

      <div className="flex-1 flex flex-col bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">

  <div className="overflow-y-auto flex-1">

    <table className="w-full">

      <thead className="sticky top-0 bg-slate-700 z-20">

        <tr>

          <th className="p-4 text-left">
            Correo
          </th>

          <th className="p-4 text-left">
            IP
          </th>

          <th className="p-4 text-left">
            Navegador
          </th>

          <th className="p-4 text-center">
            Estado
          </th>

          <th className="p-4 text-center">
            Fecha
          </th>

        </tr>

      </thead>

      <tbody>

        {logsFiltrados.length === 0 ? (

          <tr>

            <td
              colSpan="5"
              className="text-center p-8 text-slate-400"
            >
              No existen registros.
            </td>

          </tr>

        ) : (

          logsFiltrados.map((log) => (

            <tr
              key={log.id}
              onClick={() => setLogSeleccionado(log)}
              className="border-t border-slate-700 hover:bg-slate-700 transition cursor-pointer"
            >

              <td className="p-4 font-semibold">
                {log.correo}
              </td>

              <td className="p-4 text-slate-300">
                {log.ip}
              </td>

              <td className="p-4 text-slate-300 max-w-xs truncate">
                {log.navegador}
              </td>

              <td className="p-4 text-center">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${estadoBadgeClass(log.estado)}`}
                >
                  {log.estado}
                </span>

              </td>

              <td className="p-4 text-center text-slate-300">
                {formatearFecha(log.fecha)}
              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

      {/* ==========================
          MODAL DETALLE
      ========================== */}

      {logSeleccionado && (

        <div
          onClick={() => setLogSeleccionado(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8"
          >

            <div className="flex justify-between items-start mb-6">

              <div>

                <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">
                  Detalle del acceso
                </p>

                <h2 className="text-2xl font-black mt-1">
                  Registro #{logSeleccionado.id}
                </h2>

              </div>

              <button
                onClick={() => setLogSeleccionado(null)}
                className="text-slate-400 hover:text-white transition text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Estado</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${estadoBadgeClass(logSeleccionado.estado)}`}
                >
                  {logSeleccionado.estado}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Correo</span>
                <span className="font-semibold text-right">{logSeleccionado.correo}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">ID de usuario</span>
                <span className="text-slate-300">{logSeleccionado.usuario_id ?? "—"}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Dirección IP</span>
                <span className="text-slate-300">{logSeleccionado.ip}</span>
              </div>

              <div className="border-b border-slate-700 pb-3">
                <span className="text-slate-400 block mb-2">Navegador / User-Agent</span>
                <span className="text-slate-300 text-sm break-words">{logSeleccionado.navegador}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Fecha</span>
                <span className="text-slate-300">{formatearFecha(logSeleccionado.fecha)}</span>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default LoginLogs;