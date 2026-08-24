import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import RecipientPicker from "../../components/Noticias/RecipientPicker.jsx";

const TIPOS = [
  { value: "noticia", label: "Noticia" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "aviso", label: "Aviso" },
  { value: "promocion", label: "Promoción" },
];

const FORM_INICIAL = {
  titulo: "",
  contenido: "",
  tipo: "noticia",
  destinatario_tipo: "todos",
  usuario_ids: [],
};

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleString("es-CO");
};

const tipoBadgeClass = (tipo) => {
  if (tipo === "mantenimiento") return "bg-yellow-500/20 text-yellow-400";
  if (tipo === "aviso") return "bg-red-500/20 text-red-400";
  if (tipo === "promocion") return "bg-purple-500/20 text-purple-400";

  return "bg-blue-500/20 text-blue-400";
};

const Noticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

  const [mostrarPublicar, setMostrarPublicar] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [publicando, setPublicando] = useState(false);

  // ==========================
  // CARGAR DATOS
  // ==========================

  const cargarNoticias = async () => {
    try {
      const { data } = await api.get("/noticias");

      setNoticias(data.noticias || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las noticias.");
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data } = await api.get("/usuarios");

      setUsuarios(data || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los usuarios.");
    }
  };

  useEffect(() => {
    cargarNoticias();
    cargarUsuarios();
  }, []);

  // ==========================
  // PUBLICAR
  // ==========================

  const abrirPublicar = () => {
    setForm(FORM_INICIAL);
    setMostrarPublicar(true);
  };

  const publicar = async (e) => {
    e.preventDefault();

    if (
      form.destinatario_tipo === "especificos" &&
      form.usuario_ids.length === 0
    ) {
      toast.error("Selecciona al menos un usuario destinatario.");
      return;
    }

    setPublicando(true);

    try {
      const { data } = await api.post("/noticias", form);

      toast.success(
        `Noticia publicada para ${data.destinatarios} destinatario(s).`
      );

      setMostrarPublicar(false);
      setForm(FORM_INICIAL);

      await cargarNoticias();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Error al publicar la noticia."
      );
    } finally {
      setPublicando(false);
    }
  };

  // ==========================
  // FILTRO Y ESTADÍSTICAS
  // ==========================

  const noticiasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return noticias.filter((n) =>
      (n.titulo || "").toLowerCase().includes(texto)
    );
  }, [noticias, busqueda]);

  const totalNoticias = noticias.length;
  const totalTodos = noticias.filter((n) => n.destinatario_tipo === "todos").length;
  const totalEspecificas = noticias.filter((n) => n.destinatario_tipo === "especificos").length;
  const totalDestinatarios = noticias.reduce(
    (acc, n) => acc + Number(n.destinatarios_count || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Cargando noticias...
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
          <p className="text-blue-400 uppercase text-sm font-semibold tracking-widest">
            Comunicaciones
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-1">
            Gestión de Noticias
          </h1>

          <p className="text-slate-400 mt-2">
            Publica avisos, mantenimientos y promociones para tus usuarios.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirPublicar}
          className="
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
          + Publicar noticia
        </button>

      </div>

      {/* ==========================
          ESTADÍSTICAS
      ========================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400">📰 Total</p>
          <h2 className="text-4xl font-bold mt-2">{totalNoticias}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-blue-400">🌐 Para todos</p>
          <h2 className="text-4xl font-bold mt-2 text-blue-400">{totalTodos}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-purple-400">🎯 Específicas</p>
          <h2 className="text-4xl font-bold mt-2 text-purple-400">{totalEspecificas}</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <p className="text-green-400">📬 Destinatarios totales</p>
          <h2 className="text-4xl font-bold mt-2 text-green-400">{totalDestinatarios}</h2>
        </div>

      </div>

      {/* ==========================
          BUSCADOR
      ========================== */}

      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Buscar por título..."
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
      </div>

      <div className="text-slate-400 mb-4">
        Mostrando{" "}
        <span className="text-white font-semibold">{noticiasFiltradas.length}</span>
        {" "}de{" "}
        <span className="text-white font-semibold">{noticias.length}</span>
        {" "}noticias
      </div>

      {/* ==========================
          LISTA
      ========================== */}

      <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">

        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full">

            <thead className="sticky top-0 bg-slate-700 z-10">
              <tr>
                <th className="p-4 text-left">Título</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-center">Destinatarios</th>
                <th className="p-4 text-center">Leídos</th>
                <th className="p-4 text-center">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {noticiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-slate-400">
                    No existen noticias.
                  </td>
                </tr>
              ) : (
                noticiasFiltradas.map((n) => (
                  <tr
                    key={n.id}
                    onClick={() => setNoticiaSeleccionada(n)}
                    className="border-t border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <td className="p-4 font-semibold max-w-xs truncate">
                      {n.titulo}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoBadgeClass(n.tipo)}`}>
                        {n.tipo}
                      </span>
                    </td>

                    <td className="p-4 text-center text-slate-300">
                      {n.destinatario_tipo === "todos" ? "Todos" : "Específicos"}
                      {" "}({n.destinatarios_count || 0})
                    </td>

                    <td className="p-4 text-center text-slate-300">
                      {n.leidos_count || 0} / {n.destinatarios_count || 0}
                    </td>

                    <td className="p-4 text-center text-slate-300">
                      {formatearFecha(n.fecha_publicacion)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* ==========================
          MODAL PUBLICAR
      ========================== */}

      {mostrarPublicar && (
        <div
          onClick={() => !publicando && setMostrarPublicar(false)}
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
                    Publicar noticia
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarPublicar(false)}
                  className="text-slate-400 hover:text-white transition text-2xl leading-none"
                  aria-label="Cerrar"
                >
                  ×
                </button>

              </div>

              <div className="flex-1 overflow-y-auto px-8 space-y-4">

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Título</label>
                  <input
                    type="text"
                    required
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Contenido</label>
                  <textarea
                    required
                    rows={4}
                    value={form.contenido}
                    onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500 text-white"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Destinatarios</label>

                  <div className="flex gap-3">

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, destinatario_tipo: "todos" })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition ${
                        form.destinatario_tipo === "todos"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Todos los usuarios
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, destinatario_tipo: "especificos" })}
                      className={`flex-1 py-3 rounded-xl font-semibold transition ${
                        form.destinatario_tipo === "especificos"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Usuarios específicos
                    </button>

                  </div>

                </div>

                {form.destinatario_tipo === "especificos" && (
                  <RecipientPicker
                    usuarios={usuarios}
                    selectedIds={form.usuario_ids}
                    onChange={(ids) => setForm({ ...form, usuario_ids: ids })}
                  />
                )}

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
                  {publicando ? "Publicando..." : "Publicar"}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================
          MODAL DETALLE
      ========================== */}

      {noticiaSeleccionada && (
        <div
          onClick={() => setNoticiaSeleccionada(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8"
          >

            <div className="flex justify-between items-start mb-6">

              <div>
                <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">
                  Detalle
                </p>

                <h2 className="text-2xl font-black mt-1">
                  {noticiaSeleccionada.titulo}
                </h2>
              </div>

              <button
                onClick={() => setNoticiaSeleccionada(null)}
                className="text-slate-400 hover:text-white transition text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Tipo</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoBadgeClass(noticiaSeleccionada.tipo)}`}>
                  {noticiaSeleccionada.tipo}
                </span>
              </div>

              <div className="border-b border-slate-700 pb-3">
                <span className="text-slate-400 block mb-2">Contenido</span>
                <span className="text-slate-300 text-sm whitespace-pre-line">
                  {noticiaSeleccionada.contenido}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Destinatarios</span>
                <span className="text-slate-300">
                  {noticiaSeleccionada.destinatario_tipo === "todos" ? "Todos" : "Específicos"}
                  {" "}({noticiaSeleccionada.destinatarios_count || 0})
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Leídos</span>
                <span className="text-slate-300">
                  {noticiaSeleccionada.leidos_count || 0} / {noticiaSeleccionada.destinatarios_count || 0}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-slate-400">Publicado por</span>
                <span className="text-slate-300">
                  {noticiaSeleccionada.emisor_nombre || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Fecha</span>
                <span className="text-slate-300">
                  {formatearFecha(noticiaSeleccionada.fecha_publicacion)}
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Noticias;
