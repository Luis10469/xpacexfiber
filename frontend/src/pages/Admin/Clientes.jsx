import { useEffect, useState } from "react";
import api from "../../services/api.js";

import ClienteToolbar from "../../components/Clientes/ClienteToolbar.jsx";
import ClienteModal from "../../components/Clientes/ClienteModal";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [zonas, setZonas] = useState([]);

  // ==========================
  // SELECCIÓN
  // ==========================
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // ==========================
  // MODAL
  // ==========================
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // ==========================
  // FORMULARIO
  // ==========================
  const [formulario, setFormulario] = useState({
    usuario_id: "",
    nombre: "",
    correo: "",
    telefono: "",
    plan_id: "",
    zona_id: "",
    direccion: "",
    estado: "activo",
  });

  // ==========================
  // CARGA DE DATOS
  // ==========================
  const cargarClientes = async () => {
    try {
      const { data } = await api.get("/clientes");
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const cargarPlanes = async () => {
    try {
      const { data } = await api.get("/planes");
      setPlanes(data);
    } catch (error) {
      console.error("Error cargando planes:", error);
    }
  };

  const cargarZonas = async () => {
    try {
      const { data } = await api.get("/zonas");
      setZonas(data);
    } catch (error) {
      console.error("Error cargando zonas:", error);
    }
  };

  useEffect(() => {
    cargarClientes();
    cargarPlanes();
    cargarZonas();
  }, []);

  // ==========================
  // FUNCIONES
  // ==========================

  const abrirNuevoCliente = () => {
    setModoEdicion(false);
    setClienteSeleccionado(null);

    setFormulario({
      usuario_id: "",
      nombre: "",
      correo: "",
      telefono: "",
      plan_id: "",
      zona_id: "",
      direccion: "",
      estado: "activo",
    });

    setMostrarModal(true);
  };

  const editarCliente = (cliente) => {
    setModoEdicion(true);

    setClienteSeleccionado(cliente);

    setFormulario({
      id: cliente.id,
      usuario_id: cliente.usuario_id,
      nombre: cliente.nombre ?? "",
      correo: cliente.correo ?? "",
      telefono: cliente.telefono ?? "",
      plan_id: cliente.plan_id ?? "",
      zona_id: cliente.zona_id ?? "",
      direccion: cliente.direccion ?? "",
      estado: cliente.estado ?? "activo",
      fecha_instalacion: cliente.fecha_instalacion ?? "",
    });

    setMostrarModal(true);
  };

  const suspenderCliente = (id) => {
    console.log("Función de suspensión pendiente", id);
  };

  const guardarCliente = async () => {
    try {
      if (modoEdicion) {
        await api.put(
          `/clientes/${clienteSeleccionado.id}`,
          formulario
        );
      } else {
        await api.post(
          "/clientes",
          formulario
        );
      }

      setMostrarModal(false);

      setFormulario({
        usuario_id: "",
        nombre: "",
        correo: "",
        telefono: "",
        plan_id: "",
        zona_id: "",
        direccion: "",
        estado: "activo",
      });

      setClienteSeleccionado(null);

      await cargarClientes();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Ocurrió un error"
      );
    }
  };

  // ==========================
  // FECHA
  // ==========================

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaValida = new Date(fecha);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Sin fecha";
    }

    return fechaValida.toLocaleDateString("es-CO");
  };

  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-5

          lg:mb-8
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* TÍTULO */}

        <div className="min-w-0">

          <p
            className="
              text-blue-400
              uppercase
              text-xs
              sm:text-sm
              font-semibold
              tracking-widest
            "
          >
            Administración
          </p>

          <h1
            className="
              mt-1
              text-2xl
              sm:text-3xl
              lg:text-4xl
              font-bold
              text-white
              break-words
            "
          >
            Gestión de Clientes
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              sm:text-base
              text-slate-400
            "
          >
            Administra todos los clientes registrados en WiFiConnect.
          </p>

        </div>


        {/* =================================================
            BOTONES
        ================================================= */}

        <div
          className="
            w-full
            lg:w-auto
            shrink-0
          "
        >

          <ClienteToolbar
            abrirNuevoCliente={abrirNuevoCliente}
            editarCliente={editarCliente}
            suspenderCliente={suspenderCliente}
            clienteSeleccionado={clienteSeleccionado}
          />

        </div>

      </div>


      {/* =====================================================
          MODAL
      ===================================================== */}

      <ClienteModal
        mostrarModal={mostrarModal}
        modoEdicion={modoEdicion}
        formulario={formulario}
        setFormulario={setFormulario}
        guardarCliente={guardarCliente}
        setMostrarModal={setMostrarModal}
        planes={planes}
        zonas={zonas}
        recargarClientes={cargarClientes}
      />


      {/* =====================================================
          CONTENEDOR DE CLIENTES
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-700
          bg-slate-800
          shadow-2xl
        "
      >

        {/* =================================================
            VISTA ESCRITORIO / TABLET
        ================================================= */}

        <div className="hidden md:block">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-slate-700">

                <tr className="text-left text-white">

                  <th className="p-4 whitespace-nowrap">
                    Código
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Nombre
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Correo
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Teléfono
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Plan
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Zona
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Dirección
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Instalación
                  </th>

                  <th className="p-4 whitespace-nowrap">
                    Estado
                  </th>

                </tr>

              </thead>


              <tbody>

                {clientes.length === 0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="
                        p-10
                        text-center
                        text-slate-400
                      "
                    >
                      No hay clientes registrados.
                    </td>

                  </tr>

                ) : (

                  clientes.map((c) => (

                    <tr
                      key={c.id}
                      onClick={() =>
                        setClienteSeleccionado(c)
                      }
                      className={`
                        cursor-pointer
                        border-t
                        border-slate-700
                        transition

                        ${
                          clienteSeleccionado?.id === c.id
                            ? "bg-blue-900/40"
                            : "hover:bg-slate-700"
                        }
                      `}
                    >

                      <td className="p-4 font-mono text-slate-200">
                        {c.codigo_contrato}
                      </td>

                      <td className="p-4 font-semibold text-white">
                        {c.nombre}
                      </td>

                      <td className="p-4 text-slate-300">
                        {c.correo}
                      </td>

                      <td className="p-4 text-slate-300">
                        {c.telefono}
                      </td>

                      <td className="p-4 text-slate-300">
                        {c.nombre_plan}
                      </td>

                      <td className="p-4 text-slate-300">
                        {c.nombre_zona}
                      </td>

                      <td className="p-4 text-slate-300">
                        {c.direccion}
                      </td>

                      <td className="p-4 text-slate-300 whitespace-nowrap">
                        {formatearFecha(
                          c.fecha_instalacion
                        )}
                      </td>

                      <td className="p-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-bold

                            ${
                              c.estado === "activo"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          `}
                        >
                          {c.estado}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            VISTA MÓVIL
        ================================================= */}

        <div className="block md:hidden">

          {clientes.length === 0 ? (

            <div
              className="
                p-8
                text-center
                text-slate-400
              "
            >
              No hay clientes registrados.
            </div>

          ) : (

            <div className="divide-y divide-slate-700">

              {clientes.map((c) => {

                const seleccionado =
                  clienteSeleccionado?.id === c.id;

                return (

                  <article
                    key={c.id}
                    onClick={() =>
                      setClienteSeleccionado(c)
                    }
                    className={`
                      cursor-pointer
                      p-4
                      transition

                      ${
                        seleccionado
                          ? "bg-blue-900/30"
                          : "hover:bg-slate-700/50"
                      }
                    `}
                  >

                    {/* ================================
                        CABECERA TARJETA
                    ================================= */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div className="min-w-0">

                        <p
                          className="
                            font-mono
                            text-xs
                            text-blue-400
                          "
                        >
                          {c.codigo_contrato}
                        </p>

                        <h2
                          className="
                            mt-1
                            text-base
                            font-bold
                            text-white
                            break-words
                          "
                        >
                          {c.nombre}
                        </h2>

                      </div>


                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-bold

                          ${
                            c.estado === "activo"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        `}
                      >
                        {c.estado}
                      </span>

                    </div>


                    {/* ================================
                        INFORMACIÓN
                    ================================= */}

                    <div className="mt-4 space-y-3">

                      <div>

                        <p className="text-xs text-slate-500">
                          Correo
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-sm
                            text-slate-300
                            break-all
                          "
                        >
                          {c.correo || "Sin correo"}
                        </p>

                      </div>


                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >

                        <div>

                          <p className="text-xs text-slate-500">
                            Teléfono
                          </p>

                          <p className="mt-0.5 text-sm text-slate-300">
                            {c.telefono || "Sin teléfono"}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs text-slate-500">
                            Plan
                          </p>

                          <p className="mt-0.5 text-sm text-slate-300">
                            {c.nombre_plan || "Sin plan"}
                          </p>

                        </div>

                      </div>


                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                        "
                      >

                        <div>

                          <p className="text-xs text-slate-500">
                            Zona
                          </p>

                          <p className="mt-0.5 text-sm text-slate-300">
                            {c.nombre_zona || "Sin zona"}
                          </p>

                        </div>


                        <div>

                          <p className="text-xs text-slate-500">
                            Instalación
                          </p>

                          <p className="mt-0.5 text-sm text-slate-300">
                            {formatearFecha(
                              c.fecha_instalacion
                            )}
                          </p>

                        </div>

                      </div>


                      <div>

                        <p className="text-xs text-slate-500">
                          Dirección
                        </p>

                        <p className="mt-0.5 text-sm text-slate-300 break-words">
                          {c.direccion || "Sin dirección"}
                        </p>

                      </div>

                    </div>


                    {/* ================================
                        INDICADOR
                    ================================= */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        border-t
                        border-slate-700
                        pt-3
                      "
                    >

                      <span className="text-xs text-slate-500">
                        Toca para seleccionar
                      </span>

                      <span className="text-slate-500">
                        →
                      </span>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Clientes;