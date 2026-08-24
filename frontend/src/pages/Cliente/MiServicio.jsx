import { useEffect, useState } from "react";
import api from "../../services/api.js";
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Rocket,
  Zap,
  Home,
  MapPin,
  FileText,
  Calendar,
  Bell,
} from "lucide-react";

// ==========================
// ESTADO DEL SERVICIO
// ==========================

const ESTADOS = {
  activo: {
    label: "ACTIVO",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    mensaje: "Tu servicio se encuentra activo y funcionando correctamente.",
  },
  suspendido: {
    label: "SUSPENDIDO",
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    mensaje: "Tu servicio está suspendido. Comunícate con soporte para reactivarlo.",
  },
  cancelado: {
    label: "CANCELADO",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    mensaje: "Tu servicio ha sido cancelado.",
  },
};

const estadoInfo = (estado) =>
  ESTADOS[estado] || {
    label: (estado || "SIN ESTADO").toUpperCase(),
    icon: AlertTriangle,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    mensaje: "No se pudo determinar el estado de tu servicio.",
  };

const formatearFecha = (fecha) => {
  if (!fecha) return "Pendiente de instalación";

  return new Date(fecha).toLocaleDateString("es-CO");
};

const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined) return "—";

  return `$${Number(precio).toLocaleString("es-CO")}`;
};

const MiServicio = () => {
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get("/clientes/mi-servicio");

        setServicio(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  if (cargando) {
    return (
      <div className="text-white text-xl">
        Cargando información...
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="text-white text-xl">
        No se encontró información de tu servicio.
      </div>
    );
  }

  const estado = estadoInfo(servicio.estado);
  const EstadoIcon = estado.icon;

  return (
    <div className="space-y-6">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Radio className="text-blue-400" size={32} />
          Mi Servicio
        </h1>

        <p className="text-slate-400 mt-2">
          Consulta y administra la información de tu conexión.
        </p>
      </div>

      {/* ==========================
          TARJETAS PRINCIPALES
      ========================== */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* ESTADO DEL SERVICIO */}

        <div className={`bg-slate-800 rounded-2xl p-6 shadow-lg border ${estado.border}`}>
          <p className="text-slate-400">
            Estado del servicio
          </p>

          <div className={`flex items-center gap-2 mt-2 ${estado.color}`}>
            <EstadoIcon size={28} />

            <h2 className="text-3xl font-bold">
              {estado.label}
            </h2>
          </div>

          <p className="text-slate-400 text-sm mt-3">
            {estado.mensaje}
          </p>
        </div>

        {/* PLAN CONTRATADO */}

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <p className="text-slate-400">
            Plan contratado
          </p>

          <div className="flex items-center gap-2 mt-2 text-blue-400">
            <Rocket size={24} />

            <h2 className="text-2xl font-bold">
              {servicio.plan_nombre || "Sin plan asignado"}
            </h2>
          </div>

          <p className="text-cyan-400 font-semibold mt-1">
            {servicio.velocidad ? `${servicio.velocidad} Mbps` : "—"}
          </p>
        </div>

        {/* VELOCIDAD CONTRATADA */}

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <p className="text-slate-400">
            Velocidad contratada
          </p>

          <div className="flex items-center gap-2 mt-2 text-cyan-400">
            <Zap size={24} />

            <h2 className="text-3xl font-bold">
              {servicio.velocidad ? `${servicio.velocidad} Mbps` : "—"}
            </h2>
          </div>
        </div>

        {/* PRECIO MENSUAL */}

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <p className="text-slate-400">
            Precio mensual
          </p>

          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {formatearPrecio(servicio.precio)}
          </h2>
        </div>

      </div>

      {/* ==========================
          INFORMACIÓN DE INSTALACIÓN
      ========================== */}

      <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

        <h3 className="text-white font-bold flex items-center gap-2 mb-5">
          <MapPin size={18} className="text-purple-400" />
          Información de instalación
        </h3>

        <div className="grid sm:grid-cols-2 gap-6">

          <div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Home size={14} />
              Dirección
            </p>

            <p className="text-white font-semibold mt-1">
              {servicio.direccion || "No registrada"}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <MapPin size={14} />
              Zona
            </p>

            <p className="text-purple-400 font-semibold mt-1">
              {servicio.zona_nombre || "Sin asignar"}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <FileText size={14} />
              Código de contrato
            </p>

            <p className="text-white font-semibold mt-1 font-mono">
              {servicio.codigo_contrato || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Calendar size={14} />
              Fecha de instalación
            </p>

            <p className="text-white font-semibold mt-1">
              {formatearFecha(servicio.fecha_instalacion)}
            </p>
          </div>

        </div>

      </div>

      {/* ==========================
          ESTADO GENERAL (RESUMEN)
      ========================== */}

      <div className={`rounded-2xl p-5 shadow-lg border ${estado.bg} ${estado.border} flex items-center gap-3`}>
        <Bell size={20} className={estado.color} />

        <div>
          <p className={`font-semibold ${estado.color}`}>
            Estado del servicio
          </p>

          <p className="text-slate-300 text-sm">
            {estado.mensaje}
          </p>
        </div>
      </div>

    </div>
  );
};

export default MiServicio;
