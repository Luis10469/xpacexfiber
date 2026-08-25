import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { Receipt, Clock, CheckCircle2, AlertTriangle, XCircle, Calendar } from "lucide-react";

const ESTADO_INFO = {
  pendiente: { label: "Pendiente", icon: Clock, clase: "bg-yellow-500/20 text-yellow-400" },
  pagada: { label: "Pagada", icon: CheckCircle2, clase: "bg-green-500/20 text-green-400" },
  vencida: { label: "Vencida", icon: AlertTriangle, clase: "bg-red-500/20 text-red-400" },
  anulada: { label: "Anulada", icon: XCircle, clase: "bg-slate-500/20 text-slate-400" },
};

const estadoInfo = (estado) =>
  ESTADO_INFO[estado] || { label: estado || "-", icon: Clock, clase: "bg-slate-500/20 text-slate-400" };

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-CO");
};

const formatearMonto = (monto) =>
  `$${Number(monto || 0).toLocaleString("es-CO")}`;

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    const cargarFacturas = async () => {
      try {
        const { data } = await api.get("/facturas/mias");

        setFacturas(data.facturas || []);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarFacturas();
  }, []);

  const totalPendiente = facturas
    .filter((f) => f.estado === "pendiente")
    .reduce((acc, f) => acc + Number(f.monto || 0), 0);

  const totalPagado = facturas
    .filter((f) => f.estado === "pagada")
    .reduce((acc, f) => acc + Number(f.monto || 0), 0);

  if (cargando) {
    return (
      <div className="text-white text-xl">
        Cargando facturas...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Receipt className="text-blue-400" size={32} />
          Mis Facturas
        </h1>

        <p className="text-slate-400 mt-2">
          Consulta las facturas de tu servicio de Internet.
        </p>
      </div>

      {/* ==========================
          RESUMEN
      ========================== */}

      <div className="grid sm:grid-cols-2 gap-6">

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <p className="text-slate-400">Total pendiente</p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {formatearMonto(totalPendiente)}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <p className="text-slate-400">Total pagado</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {formatearMonto(totalPagado)}
          </h2>
        </div>

      </div>

      {/* ==========================
          LISTA DE FACTURAS
      ========================== */}

      {facturas.length === 0 ? (

        <div className="bg-slate-800 rounded-2xl p-10 shadow-lg text-center">
          <p className="text-slate-400">Aún no tienes facturas registradas.</p>
        </div>

      ) : (

        <>

          {/* TABLA — ESCRITORIO */}

          <div className="hidden lg:block bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">

            <table className="w-full">

              <thead className="bg-slate-700">
                <tr className="text-left">
                  <th className="p-4">ID</th>
                  <th className="p-4">Periodo</th>
                  <th className="p-4 text-right">Monto</th>
                  <th className="p-4 text-center">Emisión</th>
                  <th className="p-4 text-center">Vencimiento</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>

              <tbody>
                {facturas.map((f) => {
                  const info = estadoInfo(f.estado);
                  const Icono = info.icon;

                  return (
                    <tr
                      key={f.id}
                      className="border-t border-slate-700 hover:bg-slate-700 transition"
                    >
                      <td className="p-4 font-semibold font-mono">#{f.numero}</td>

                      <td className="p-4 text-slate-300">{f.periodo || "-"}</td>

                      <td className="p-4 text-right font-semibold text-white">
                        {formatearMonto(f.monto)}
                      </td>

                      <td className="p-4 text-center text-slate-300">
                        {formatearFecha(f.fecha_emision)}
                      </td>

                      <td className="p-4 text-center text-slate-300">
                        {formatearFecha(f.fecha_vencimiento)}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${info.clase}`}>
                          <Icono size={12} />
                          {info.label}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => setFacturaSeleccionada(f)}
                          className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-semibold text-white text-sm"
                        >
                          Ver factura
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>

          </div>

          {/* TARJETAS — MÓVIL */}

          <div className="grid sm:grid-cols-2 lg:hidden gap-6">

            {facturas.map((f) => {
              const info = estadoInfo(f.estado);
              const Icono = info.icon;

              return (
                <div
                  key={f.id}
                  className="bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col"
                >

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Factura</p>
                      <h3 className="text-lg font-bold text-white font-mono">
                        #{f.numero}
                      </h3>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${info.clase}`}>
                      <Icono size={12} />
                      {info.label}
                    </span>
                  </div>

                  <p className="text-slate-400 mt-3">{f.periodo || "-"}</p>

                  <h2 className="text-3xl font-bold text-white mt-2">
                    {formatearMonto(f.monto)}
                  </h2>

                  <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <Calendar size={14} />
                      Emisión: {formatearFecha(f.fecha_emision)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar size={14} />
                      Vencimiento: {formatearFecha(f.fecha_vencimiento)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFacturaSeleccionada(f)}
                    className="
                      mt-5
                      bg-blue-600
                      hover:bg-blue-700
                      transition
                      py-3
                      rounded-xl
                      font-semibold
                      text-white
                    "
                  >
                    Ver factura
                  </button>

                </div>
              );
            })}

          </div>

        </>

      )}

      {/* ==========================
          MODAL: DETALLE
      ========================== */}

      {facturaSeleccionada && (
        <div
          onClick={() => setFacturaSeleccionada(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8"
          >

            <div className="flex justify-between items-start mb-6">

              <div>
                <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">
                  Detalle de factura
                </p>

                <h2 className="text-2xl font-black mt-1 font-mono text-white">
                  {facturaSeleccionada.numero}
                </h2>
              </div>

              <button
                onClick={() => setFacturaSeleccionada(null)}
                className="text-slate-400 hover:text-white transition text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Periodo</span>
                <span className="text-slate-300">{facturaSeleccionada.periodo || "-"}</span>
              </div>

              <div className="border-b border-slate-700 pb-3">
                <span className="text-slate-400 block mb-1">Concepto</span>
                <span className="text-slate-300 text-sm">{facturaSeleccionada.concepto || "-"}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Valor</span>
                <span className="text-yellow-400 font-bold text-lg">
                  {formatearMonto(facturaSeleccionada.monto)}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Fecha de emisión</span>
                <span className="text-slate-300">{formatearFecha(facturaSeleccionada.fecha_emision)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Fecha de vencimiento</span>
                <span className="text-slate-300">{formatearFecha(facturaSeleccionada.fecha_vencimiento)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Estado</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${estadoInfo(facturaSeleccionada.estado).clase}`}>
                  {estadoInfo(facturaSeleccionada.estado).label}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Facturas;
