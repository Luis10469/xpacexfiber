import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import ClientPicker from "../../components/Facturacion/ClientPicker.jsx";
import ConfirmModal from "../../components/Modals/ConfirmModal.jsx";

const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagada", label: "Pagada" },
  { value: "vencida", label: "Vencida" },
  { value: "anulada", label: "Anulada" },
];

const DIAS_VENCIMIENTO_DEFECTO = 6;

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const FORM_INICIAL = {
  cliente: null,
  plan_id: "",
  periodo: "",
  concepto: "",
  monto: "",
  fecha_emision: new Date().toISOString().slice(0, 10),
  fecha_vencimiento: "",
  estado: "pendiente",
};

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-CO");
};

const formatearMonto = (monto) =>
  `$${Number(monto || 0).toLocaleString("es-CO")}`;

// Sugiere el periodo (ej. "Agosto 2026") a partir de una fecha.
const periodoSugerido = (fechaISO) => {
  const fecha = fechaISO ? new Date(`${fechaISO}T00:00:00`) : new Date();
  const mes = MESES[fecha.getMonth()];

  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${fecha.getFullYear()}`;
};

// Suma días a una fecha ISO (yyyy-mm-dd) y devuelve otra fecha ISO.
const sumarDias = (fechaISO, dias) => {
  const fecha = new Date(`${fechaISO}T00:00:00`);

  fecha.setDate(fecha.getDate() + dias);

  return fecha.toISOString().slice(0, 10);
};

const ESTADO_INFO = {
  pendiente: { label: "Pendiente", icon: Clock, clase: "bg-yellow-500/20 text-yellow-400" },
  pagada: { label: "Pagada", icon: CheckCircle2, clase: "bg-green-500/20 text-green-400" },
  vencida: { label: "Vencida", icon: AlertTriangle, clase: "bg-red-500/20 text-red-400" },
  anulada: { label: "Anulada", icon: XCircle, clase: "bg-slate-500/20 text-slate-400" },
};

const estadoInfo = (estado) =>
  ESTADO_INFO[estado] || { label: estado || "-", icon: Clock, clase: "bg-slate-500/20 text-slate-400" };

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");

  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [publicando, setPublicando] = useState(false);

  // Confirmación cuando ya existe una factura del mismo cliente/periodo
  const [confirmarDuplicado, setConfirmarDuplicado] = useState(null);

  // ==========================
  // CARGAR DATOS
  // ==========================

  const cargarFacturas = async () => {
    try {
      const params = {};

      if (filtroEstado) params.estado = filtroEstado;
      if (filtroPeriodo) params.periodo = filtroPeriodo;

      const { data } = await api.get("/facturas", { params });

      setFacturas(data.facturas || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las facturas.");
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const { data } = await api.get("/clientes");

      setClientes(data || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los clientes.");
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    cargarFacturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroPeriodo]);

  // ==========================
  // CREAR / PUBLICAR FACTURA
  // ==========================

  const abrirCrear = () => {
    setForm(FORM_INICIAL);
    setMostrarCrear(true);
  };

  // Al elegir un cliente, autocompleta plan/precio/concepto/periodo/
  // vencimiento a partir de datos reales — el admin puede modificarlos
  // antes de publicar.
  const seleccionarCliente = (cliente) => {
    const vencimiento = sumarDias(
      form.fecha_emision,
      Number(cliente.dias_vencimiento) || DIAS_VENCIMIENTO_DEFECTO
    );

    setForm({
      ...FORM_INICIAL,
      cliente,
      fecha_emision: form.fecha_emision,
      plan_id: cliente.plan_id || "",
      monto: cliente.precio_plan ? String(cliente.precio_plan) : "",
      concepto: cliente.nombre_plan
        ? `Servicio de Internet - ${cliente.nombre_plan}`
        : "",
      periodo: periodoSugerido(form.fecha_emision),
      fecha_vencimiento: vencimiento,
    });
  };

  const enviarFactura = async (forzar = false) => {
    setPublicando(true);

    try {
      const { data } = await api.post("/facturas", {
        cliente_id: form.cliente.id,
        plan_id: form.plan_id || null,
        monto: Number(form.monto),
        periodo: form.periodo,
        concepto: form.concepto,
        fecha_emision: form.fecha_emision,
        fecha_vencimiento: form.fecha_vencimiento || null,
        estado: form.estado,
        forzar,
      });

      toast.success(
        `Factura ${data.factura.numero} publicada y notificación enviada a ${data.cliente.nombre}.`
      );

      setMostrarCrear(false);
      setForm(FORM_INICIAL);
      setConfirmarDuplicado(null);

      await cargarFacturas();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 409) {
        setConfirmarDuplicado(error.response.data.message);
        return;
      }

      toast.error(
        error.response?.data?.message || "Error al publicar la factura."
      );
    } finally {
      setPublicando(false);
    }
  };

  const publicar = async (e) => {
    e.preventDefault();

    if (!form.cliente) {
      toast.error("Selecciona un cliente.");
      return;
    }

    if (!form.monto || Number(form.monto) <= 0) {
      toast.error("Ingresa un valor válido para la factura.");
      return;
    }

    await enviarFactura(false);
  };

  // ==========================
  // ACTUALIZAR ESTADO
  // ==========================

  const cambiarEstado = async (nuevoEstado) => {
    if (!facturaSeleccionada) return;

    setActualizandoEstado(true);

    try {
      const { data } = await api.put(
        `/facturas/${facturaSeleccionada.id}/estado`,
        { estado: nuevoEstado }
      );

      toast.success("Estado actualizado correctamente.");

      setFacturaSeleccionada(data.factura);

      await cargarFacturas();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Error al actualizar el estado."
      );
    } finally {
      setActualizandoEstado(false);
    }
  };

  // ==========================
  // FILTRO Y ESTADÍSTICAS
  // ==========================

  const facturasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return facturas.filter((f) =>
      (f.numero || "").toLowerCase().includes(texto) ||
      (f.cliente_nombre || "").toLowerCase().includes(texto) ||
      (f.cliente_correo || "").toLowerCase().includes(texto)
    );
  }, [facturas, busqueda]);

  const totalFacturado = facturas.reduce((acc, f) => acc + Number(f.monto || 0), 0);
  const totalPendientes = facturas.filter((f) => f.estado === "pendiente").length;
  const totalPagadas = facturas.filter((f) => f.estado === "pagada").length;
  const totalVencidas = facturas.filter((f) => f.estado === "vencida").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Cargando facturas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

        <div>
          <p className="text-blue-400 uppercase text-sm font-semibold tracking-widest flex items-center gap-2">
            <Receipt size={16} />
            Administración
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Gestión de Facturación
          </h1>

          <p className="text-slate-400 mt-2">
            Crea y publica facturas para tus clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            transition
            px-6
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            w-full
            md:w-auto
          "
        >
          <Plus size={18} />
          Nueva factura
        </button>

      </div>

      {/* ==========================
          ESTADÍSTICAS
      ========================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 flex items-center gap-2">
            <DollarSign size={16} />
            Total facturado
          </p>
          <h2 className="text-3xl font-bold mt-2 text-blue-400">
            {formatearMonto(totalFacturado)}
          </h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-yellow-400 flex items-center gap-2">
            <Clock size={16} />
            Pendientes
          </p>
          <h2 className="text-3xl font-bold mt-2 text-yellow-400">{totalPendientes}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-green-400 flex items-center gap-2">
            <CheckCircle2 size={16} />
            Pagadas
          </p>
          <h2 className="text-3xl font-bold mt-2 text-green-400">{totalPagadas}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} />
            Vencidas
          </p>
          <h2 className="text-3xl font-bold mt-2 text-red-400">{totalVencidas}</h2>
        </div>

      </div>

      {/* ==========================
          BUSCADOR Y FILTROS
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        <input
          type="text"
          placeholder="🔍 Buscar por número o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
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
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
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
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por periodo (ej. Agosto 2026)"
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
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
        />

      </div>

      <div className="text-slate-400 mb-4">
        Mostrando{" "}
        <span className="text-white font-semibold">{facturasFiltradas.length}</span>
        {" "}de{" "}
        <span className="text-white font-semibold">{facturas.length}</span>
        {" "}facturas
      </div>

      {/* ==========================
          LISTA
      ========================== */}

      <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">

        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[60vh] min-w-[720px]">
            <table className="w-full">

              <thead className="sticky top-0 bg-slate-700 z-10">
                <tr>
                  <th className="p-4 text-left">Número</th>
                  <th className="p-4 text-left">Cliente</th>
                  <th className="p-4 text-left">Periodo</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Emisión</th>
                  <th className="p-4 text-center">Vencimiento</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>

              <tbody>
                {facturasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-slate-400">
                      No existen facturas.
                    </td>
                  </tr>
                ) : (
                  facturasFiltradas.map((f) => {
                    const info = estadoInfo(f.estado);
                    const Icono = info.icon;

                    return (
                      <tr
                        key={f.id}
                        onClick={() => setFacturaSeleccionada(f)}
                        className="border-t border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                      >
                        <td className="p-4 font-semibold font-mono">{f.numero}</td>

                        <td className="p-4">
                          <p className="text-white">{f.cliente_nombre}</p>
                          <p className="text-slate-400 text-xs">{f.cliente_correo}</p>
                        </td>

                        <td className="p-4 text-slate-300">{f.periodo || "-"}</td>

                        <td className="p-4 text-right font-semibold text-yellow-400">
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
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>

      {/* ==========================
          MODAL: NUEVA FACTURA
      ========================== */}

      {mostrarCrear && (
        <div
          onClick={() => !publicando && setMostrarCrear(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
          >

            <form onSubmit={publicar} className="flex flex-col overflow-hidden">

              <div className="flex justify-between items-start p-8 pb-4 shrink-0">

                <div>
                  <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">
                    Nueva publicación
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    Crear factura
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarCrear(false)}
                  className="text-slate-400 hover:text-white transition text-2xl leading-none"
                  aria-label="Cerrar"
                >
                  ×
                </button>

              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-4">

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Cliente</label>

                  {form.cliente ? (
                    <div className="border border-blue-500/40 bg-blue-900/20 rounded-xl p-4 flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{form.cliente.nombre}</p>
                        <p className="text-slate-400 text-sm">{form.cliente.correo}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {form.cliente.nombre_plan || "Sin plan"} · {form.cliente.nombre_zona || "Sin zona"} · {form.cliente.codigo_contrato}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, cliente: null })}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <ClientPicker
                      clientes={clientes}
                      selectedId={null}
                      onSelect={seleccionarCliente}
                    />
                  )}
                </div>

                {form.cliente && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Plan contratado</label>
                    <p className="text-white font-semibold">
                      {form.cliente.nombre_plan || "Sin plan asignado"}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Periodo de facturación</label>
                    <input
                      value={form.periodo}
                      onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                      placeholder="Ej. Agosto 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Valor</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.monto}
                      onChange={(e) => setForm({ ...form, monto: e.target.value })}
                      placeholder="99900"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Concepto</label>
                  <input
                    value={form.concepto}
                    onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                    placeholder="Ej. Servicio de Internet - Plan Ultra"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Fecha de emisión</label>
                    <input
                      type="date"
                      required
                      value={form.fecha_emision}
                      onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Fecha de vencimiento</label>
                    <input
                      type="date"
                      value={form.fecha_vencimiento}
                      onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="p-8 pt-4 shrink-0">
                <button
                  type="submit"
                  disabled={publicando}
                  className="
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    transition
                    py-3
                    rounded-xl
                    font-semibold
                    text-white
                  "
                >
                  {publicando ? "Publicando..." : "Publicar factura"}
                </button>
              </div>

            </form>

          </div>

        </div>
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

                <h2 className="text-2xl font-black mt-1 font-mono">
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
                <span className="text-slate-400">Cliente</span>
                <span className="text-white text-right">
                  {facturaSeleccionada.cliente_nombre}
                </span>
              </div>

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
                <span className="text-slate-400">Emisión</span>
                <span className="text-slate-300">{formatearFecha(facturaSeleccionada.fecha_emision)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Vencimiento</span>
                <span className="text-slate-300">{formatearFecha(facturaSeleccionada.fecha_vencimiento)}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-2">Cambiar estado</span>

                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      disabled={actualizandoEstado || facturaSeleccionada.estado === e.value}
                      onClick={() => cambiarEstado(e.value)}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-bold transition
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${estadoInfo(e.value).clase}
                        ${facturaSeleccionada.estado === e.value ? "ring-2 ring-white/40" : "hover:brightness-125"}
                      `}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================
          CONFIRMAR FACTURA DUPLICADA
      ========================== */}

      <ConfirmModal
        open={Boolean(confirmarDuplicado)}
        title="¿Publicar de todas formas?"
        message={confirmarDuplicado}
        subMessage="Se creará una factura adicional para el mismo cliente y periodo."
        icon="warning"
        color="yellow"
        confirmText="Sí, publicar igual"
        cancelText="Cancelar"
        onConfirm={() => enviarFactura(true)}
        onCancel={() => setConfirmarDuplicado(null)}
      />

    </div>
  );
};

export default Facturacion;
