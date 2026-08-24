import { useEffect, useState } from "react";
import api from "../../services/api.js";
import toast from "react-hot-toast";
import "../../components/Reportes/chartSetup.js";
import IngresosMensualesChart from "../../components/Reportes/IngresosMensualesChart.jsx";
import ClientesPorZonaChart from "../../components/Reportes/ClientesPorZonaChart.jsx";
import TicketsPorEstadoChart from "../../components/Reportes/TicketsPorEstadoChart.jsx";
import PlanesMasContratadosChart from "../../components/Reportes/PlanesMasContratadosChart.jsx";
import CrecimientoClientesChart from "../../components/Reportes/CrecimientoClientesChart.jsx";

const DATOS_INICIALES = {
  resumen: {
    clientesActivos: 0,
    ingresosMes: 0,
    ticketsAbiertos: 0,
    zonasCubiertas: 0,
  },
  ingresosMensuales: [],
  clientesPorZona: [],
  ticketsPorEstado: [],
  planesMasContratados: [],
  crecimientoClientes: [],
};

const Reportes = () => {
  const [datos, setDatos] = useState(DATOS_INICIALES);
  const [zonas, setZonas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    meses: "6",
    zona_id: "",
    plan_id: "",
  });

  // ==========================
  // CARGAR ZONAS Y PLANES (FILTROS)
  // ==========================

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [resZonas, resPlanes] = await Promise.all([
          api.get("/zonas"),
          api.get("/planes"),
        ]);

        setZonas(resZonas.data || []);
        setPlanes(resPlanes.data || []);
      } catch (error) {
        console.error("Error cargando zonas/planes:", error);
      }
    };

    cargarFiltros();
  }, []);

  // ==========================
  // CARGAR REPORTES
  // ==========================

  useEffect(() => {
    const cargarReportes = async () => {
      setCargando(true);

      try {
        const params = Object.fromEntries(
          Object.entries(filtros).filter(([, v]) => v !== "")
        );

        const { data } = await api.get("/reportes", { params });

        setDatos(data);
      } catch (error) {
        console.error("Error cargando reportes:", error);
        toast.error("No se pudieron cargar los reportes.");
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, [filtros]);

  const actualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="w-full">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="mb-8">
        <p className="text-blue-400 uppercase text-sm font-semibold tracking-widest">
          Administración
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
          Reportes y Estadísticas
        </h1>

        <p className="text-slate-400 mt-2">
          Indicadores en tiempo real del sistema, con datos reales de la base de datos.
        </p>
      </div>

      {/* ==========================
          FILTROS
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <select
          value={filtros.meses}
          onChange={(e) => actualizarFiltro("meses", e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            px-5
            py-4
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            text-white
          "
        >
          <option value="3">Últimos 3 meses</option>
          <option value="6">Últimos 6 meses</option>
          <option value="12">Últimos 12 meses</option>
        </select>

        <select
          value={filtros.zona_id}
          onChange={(e) => actualizarFiltro("zona_id", e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            px-5
            py-4
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            text-white
          "
        >
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>{z.nombre}</option>
          ))}
        </select>

        <select
          value={filtros.plan_id}
          onChange={(e) => actualizarFiltro("plan_id", e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            px-5
            py-4
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            text-white
          "
        >
          <option value="">Todos los planes</option>
          {planes.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

      </div>

      {/* ==========================
          TARJETAS
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-2xl
          p-8
          shadow-xl
          hover:border-blue-500
          hover:shadow-blue-500/10
          transition-all
        ">
          <p className="text-slate-400 text-lg">👥 Clientes Activos</p>
          <h2 className="text-5xl font-bold text-blue-500 mt-4">
            {datos.resumen.clientesActivos}
          </h2>
        </div>

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-2xl
          p-8
          shadow-xl
          hover:border-green-500
          hover:shadow-green-500/10
          transition-all
        ">
          <p className="text-slate-400 text-lg">💰 Ingresos del Mes</p>
          <h2 className="text-5xl font-bold text-green-500 mt-4">
            ${datos.resumen.ingresosMes.toLocaleString("es-CO")}
          </h2>
        </div>

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-2xl
          p-8
          shadow-xl
          hover:border-red-500
          hover:shadow-red-500/10
          transition-all
        ">
          <p className="text-slate-400 text-lg">🎫 Tickets Abiertos</p>
          <h2 className="text-5xl font-bold text-red-500 mt-4">
            {datos.resumen.ticketsAbiertos}
          </h2>
        </div>

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-2xl
          p-8
          shadow-xl
          hover:border-purple-500
          hover:shadow-purple-500/10
          transition-all
        ">
          <p className="text-slate-400 text-lg">📍 Zonas Cubiertas</p>
          <h2 className="text-5xl font-bold text-purple-500 mt-4">
            {datos.resumen.zonasCubiertas}
          </h2>
        </div>

      </div>

      {/* ==========================
          GRÁFICAS
      ========================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Ingresos mensuales</h3>
          <IngresosMensualesChart data={datos.ingresosMensuales} />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Clientes por zona</h3>
          <ClientesPorZonaChart data={datos.clientesPorZona} />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Tickets por estado</h3>
          <TicketsPorEstadoChart data={datos.ticketsPorEstado} />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Planes más contratados</h3>
          <PlanesMasContratadosChart data={datos.planesMasContratados} />
        </div>

        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white mb-4">Crecimiento de clientes</h3>
          <CrecimientoClientesChart data={datos.crecimientoClientes} />
        </div>

      </div>

      {cargando && (
        <p className="text-slate-500 text-sm text-center mt-6">
          Actualizando datos...
        </p>
      )}

    </div>
  );
};

export default Reportes;
