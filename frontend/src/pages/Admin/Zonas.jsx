import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ZonaModal from "../../components/Zonas/ZonaModal";
import ConfirmModal from "../../components/Modals/ConfirmModal";

const Zonas = () => {
  // ==========================
  // DATOS
  // ==========================

  const [zonas, setZonas] = useState([]);

  // ==========================
  // SELECCIÓN
  // ==========================

  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);

  // ==========================
  // MODAL
  // ==========================

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // ==========================
  // FORMULARIO
  // ==========================

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    estado: 1,
  });

  // ==========================
  // BUSQUEDA
  // ==========================

  const [busqueda, setBusqueda] = useState("");

  // ==========================
  // CONFIRMACIÓN ELIMINAR
  // ==========================

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [zonaAEliminar, setZonaAEliminar] = useState(null);

  // ==========================
  // CARGAR ZONAS
  // ==========================

  const cargarZonas = async () => {
    try {
      const { data } = await api.get("/zonas");

      setZonas(data);
    } catch (error) {
      console.error(error);

      toast.error("No se pudieron cargar las zonas.");
    }
  };

  useEffect(() => {
    cargarZonas();
  }, []);

  // ==========================
  // NUEVA ZONA
  // ==========================

  const abrirNuevaZona = () => {
    setModoEdicion(false);
    setZonaSeleccionada(null);

    setFormulario({
      nombre: "",
      descripcion: "",
      estado: 1,
    });

    setMostrarModal(true);
  };

  // ==========================
  // EDITAR ZONA
  // ==========================

  const editarZona = (zona) => {
    if (!zona) return;

    setModoEdicion(true);

    setZonaSeleccionada(zona);

    setFormulario({
      nombre: zona.nombre ?? "",
      descripcion: zona.descripcion ?? "",
      estado: Number(zona.estado),
    });

    setMostrarModal(true);
  };

  // ==========================
  // GUARDAR ZONA
  // ==========================

  const guardarZona = async () => {
    try {
      if (modoEdicion) {
        await api.put(
          `/zonas/${zonaSeleccionada.id}`,
          formulario
        );

        toast.success("Zona actualizada correctamente");
      } else {
        await api.post("/zonas", formulario);

        toast.success("Zona creada correctamente");
      }

      setMostrarModal(false);

      setZonaSeleccionada(null);

      await cargarZonas();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error."
      );
    }
  };

  // ==========================
  // ABRIR ELIMINAR
  // ==========================

  const abrirEliminarZona = (zona) => {
    if (!zona) return;

    setZonaAEliminar(zona);
    setMostrarConfirmacion(true);
  };

  // ==========================
  // ELIMINAR ZONA
  // ==========================

  const eliminarZona = async () => {
    if (!zonaAEliminar) return;

    try {
      await api.delete(`/zonas/${zonaAEliminar.id}`);

      toast.success("Zona eliminada correctamente");

      setMostrarConfirmacion(false);
      setZonaAEliminar(null);
      setZonaSeleccionada(null);

      await cargarZonas();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "No se pudo eliminar la zona."
      );
    }
  };

  // ==========================
  // FILTRAR
  // ==========================

  const zonasFiltradas = zonas.filter((zona) => {
    const nombre = zona.nombre?.toLowerCase() || "";

    const descripcion =
      zona.descripcion?.toLowerCase() || "";

    const textoBusqueda = busqueda.toLowerCase();

    return (
      nombre.includes(textoBusqueda) ||
      descripcion.includes(textoBusqueda)
    );
  });

  // ==========================
  // RENDER
  // ==========================

  return (
    <div className="w-full">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 mb-8">

        <div>
          <p className="text-blue-400 uppercase text-sm font-semibold tracking-widest">
            Administración
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Gestión de Zonas
          </h1>

          <p className="text-slate-400 mt-2">
            Administra todas las zonas de cobertura de Spacex Fiber.
          </p>
        </div>

      </div>

      {/* ==========================
          TARJETAS ESTADÍSTICAS
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* TOTAL */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
          shadow-xl
        ">
          <p className="text-slate-400">
            📍 Total Zonas
          </p>

          <h2 className="text-4xl font-bold mt-2 text-white">
            {zonas.length}
          </h2>
        </div>

        {/* ACTIVAS */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
          shadow-xl
        ">
          <p className="text-green-400">
            🟢 Activas
          </p>

          <h2 className="text-4xl font-bold mt-2 text-green-400">
            {
              zonas.filter(
                (zona) => Number(zona.estado) === 1
              ).length
            }
          </h2>
        </div>

        {/* INACTIVAS */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
          shadow-xl
        ">
          <p className="text-red-400">
            🔴 Inactivas
          </p>

          <h2 className="text-4xl font-bold mt-2 text-red-400">
            {
              zonas.filter(
                (zona) => Number(zona.estado) !== 1
              ).length
            }
          </h2>
        </div>

      </div>

      {/* ==========================
          BUSCADOR
      ========================== */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="🔍 Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="
            w-full
            bg-slate-800
            border
            border-slate-700
            rounded-xl
            p-4
            text-white
            outline-none
            focus:border-blue-500
            transition
          "
        />

      </div>

      {/* ==========================
          BOTONES
      ========================== */}

      <div className="
        flex
        flex-col
        sm:flex-row
        gap-3
        mb-6
      ">

        {/* NUEVA */}

        <button
          onClick={abrirNuevaZona}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            transition
          "
        >
          + Nueva Zona
        </button>

        {/* EDITAR */}

        <button
          disabled={!zonaSeleccionada}
          onClick={() => editarZona(zonaSeleccionada)}
          className={`
            px-6
            py-3
            rounded-xl
            font-semibold
            transition

            ${
              zonaSeleccionada
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }
          `}
        >
          ✏️ Editar
        </button>

        {/* ELIMINAR */}

        <button
          disabled={!zonaSeleccionada}
          onClick={() => abrirEliminarZona(zonaSeleccionada)}
          className={`
            px-6
            py-3
            rounded-xl
            font-semibold
            transition

            ${
              zonaSeleccionada
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }
          `}
        >
          🗑️ Eliminar
        </button>

      </div>

      {/* ==========================
          CONTADOR
      ========================== */}

      <p className="text-slate-400 mb-4">
        Mostrando{" "}
        <span className="text-white font-semibold">
          {zonasFiltradas.length}
        </span>{" "}
        de{" "}
        <span className="text-white font-semibold">
          {zonas.length}
        </span>{" "}
        zonas
      </p>

      {/* =====================================================
          VISTA CELULAR
      ===================================================== */}

      <div className="md:hidden space-y-4">

        {zonasFiltradas.length === 0 ? (

          <div className="
            bg-slate-800
            border
            border-slate-700
            rounded-2xl
            p-8
            text-center
            text-slate-400
          ">
            No existen zonas registradas.
          </div>

        ) : (

          zonasFiltradas.map((zona) => {

            const seleccionada =
              zonaSeleccionada?.id === zona.id;

            return (

              <div
                key={zona.id}
                onClick={() =>
                  setZonaSeleccionada(zona)
                }
                className={`
                  bg-slate-800
                  border
                  rounded-2xl
                  p-6
                  shadow-xl
                  cursor-pointer
                  transition-all

                  ${
                    seleccionada
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-slate-700 hover:border-slate-500"
                  }
                `}
              >

                {/* CABECERA */}

                <div className="
                  flex
                  justify-between
                  items-start
                  gap-4
                  mb-5
                ">

                  <div>

                    <p className="text-blue-400 text-sm font-mono mb-1">
                      ZONA-{zona.id}
                    </p>

                    <h2 className="text-xl font-bold text-white">
                      {zona.nombre}
                    </h2>

                  </div>

                  <span
                    className={`
                      shrink-0
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold

                      ${
                        Number(zona.estado) === 1
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    `}
                  >
                    {Number(zona.estado) === 1
                      ? "Activa"
                      : "Inactiva"}
                  </span>

                </div>

                {/* DESCRIPCIÓN */}

                <div className="
                  border-t
                  border-slate-700
                  pt-4
                ">

                  <p className="text-slate-500 text-sm mb-1">
                    Descripción
                  </p>

                  <p className="
                    text-slate-300
                    leading-relaxed
                    break-words
                  ">
                    {zona.descripcion || "Sin descripción"}
                  </p>

                </div>

                {/* SELECCIÓN */}

                <div className="
                  border-t
                  border-slate-700
                  mt-5
                  pt-4
                  text-slate-500
                  text-sm
                ">
                  {seleccionada
                    ? "✓ Zona seleccionada"
                    : "Toca para seleccionar"}
                </div>

              </div>

            );
          })

        )}

      </div>

      {/* =====================================================
          VISTA PC / TABLET
      ===================================================== */}

      <div className="
        hidden
        md:block
        bg-slate-800
        rounded-2xl
        overflow-hidden
        border
        border-slate-700
        shadow-2xl
      ">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-700">

              <tr className="text-left text-white">

                <th className="p-4">
                  Nombre
                </th>

                <th className="p-4">
                  Descripción
                </th>

                <th className="p-4 text-center">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {zonasFiltradas.length === 0 ? (

                <tr>

                  <td
                    colSpan="3"
                    className="
                      text-center
                      p-10
                      text-slate-400
                    "
                  >
                    No existen zonas registradas.
                  </td>

                </tr>

              ) : (

                zonasFiltradas.map((zona) => {

                  const seleccionada =
                    zonaSeleccionada?.id === zona.id;

                  return (

                    <tr
                      key={zona.id}
                      onClick={() =>
                        setZonaSeleccionada(zona)
                      }
                      className={`
                        border-t
                        border-slate-700
                        cursor-pointer
                        transition

                        ${
                          seleccionada
                            ? "bg-blue-900/40"
                            : "hover:bg-slate-700"
                        }
                      `}
                    >

                      <td className="
                        p-4
                        font-semibold
                        text-white
                      ">
                        {zona.nombre}
                      </td>

                      <td className="
                        p-4
                        text-slate-300
                        max-w-md
                      ">
                        {zona.descripcion ||
                          "Sin descripción"}
                      </td>

                      <td className="p-4 text-center">

                        <span
                          className={`
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-bold

                            ${
                              Number(zona.estado) === 1
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          `}
                        >
                          {Number(zona.estado) === 1
                            ? "Activa"
                            : "Inactiva"}
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

      {/* ==========================
          MODAL ZONA
      ========================== */}

      <ZonaModal
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        formulario={formulario}
        setFormulario={setFormulario}
        guardarZona={guardarZona}
        modoEdicion={modoEdicion}
      />

      {/* ==========================
          CONFIRMAR ELIMINACIÓN
      ========================== */}

      <ConfirmModal
        open={mostrarConfirmacion}
        title="¿Eliminar esta zona?"
        message="Esta acción eliminará la zona del sistema."
        subMessage="No podrás recuperar esta información."
        icon="delete"
        color="red"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={eliminarZona}
        onCancel={() => {
          setMostrarConfirmacion(false);
          setZonaAEliminar(null);
        }}
      />

    </div>
  );
};

export default Zonas;