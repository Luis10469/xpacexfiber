import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/Modals/ConfirmModal";

export default function Usuarios() {
  // ===============================
  // ESTADOS
  // ===============================

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [usuarioAConvertir, setUsuarioAConvertir] = useState(null);

  // ===============================
  // CARGAR USUARIOS
  // ===============================

  const obtenerUsuarios = async () => {
    try {
      const { data } = await api.get("/usuarios");

      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // ===============================
  // ABRIR CONVERTIR CLIENTE
  // ===============================

  const abrirConvertirCliente = (usuario) => {
    setUsuarioAConvertir(usuario);
    setMostrarConfirmacion(true);
  };

  // ===============================
  // CONVERTIR EN CLIENTE
  // ===============================

  const convertirCliente = async () => {
    if (!usuarioAConvertir) return;

    try {
      const { data } = await api.post(
        `/usuarios/${usuarioAConvertir.id}/convertir`
      );

      toast.success(data.message);

      setMostrarConfirmacion(false);
      setUsuarioAConvertir(null);

      await obtenerUsuarios();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error al convertir el usuario."
      );
    }
  };

  // ===============================
  // FILTRO
  // ===============================

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return usuarios.filter((u) => {
      const nombre = (u.nombre || "").toLowerCase();
      const correo = (u.correo || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        correo.includes(texto)
      );
    });
  }, [usuarios, busqueda]);

  // ===============================
  // ESTADÍSTICAS
  // ===============================

  const totalUsuarios = usuarios.length;

  const totalClientes = usuarios.filter(
    (u) => u.es_cliente
  ).length;

  const totalNoClientes = usuarios.filter(
    (u) => !u.es_cliente
  ).length;

  const totalAdmins = usuarios.filter(
    (u) => u.rol === "admin"
  ).length;

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Cargando usuarios...
      </div>
    );
  }

  // ===============================
  // VISTA
  // ===============================

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-5
        mb-8
      ">

        <div>
          <p className="
            text-blue-400
            uppercase
            text-sm
            font-semibold
            tracking-widest
          ">
            Administración
          </p>

          <h1 className="
            text-3xl
            md:text-4xl
            font-bold
            mt-1
          ">
            Gestión de Usuarios
          </h1>

          <p className="text-slate-400 mt-2">
            Administra todos los usuarios registrados en Spacex Fiber.
          </p>
        </div>

        <button
          type="button"
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
          + Nuevo Usuario
        </button>

      </div>


      {/* ==========================
          ESTADÍSTICAS
      ========================== */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-5
        mb-8
      ">

        {/* USUARIOS */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
        ">

          <p className="text-slate-400">
            👥 Usuarios
          </p>

          <h2 className="
            text-4xl
            font-bold
            mt-2
            text-white
          ">
            {totalUsuarios}
          </h2>

        </div>


        {/* CLIENTES */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
        ">

          <p className="text-green-400">
            🟢 Clientes
          </p>

          <h2 className="
            text-4xl
            font-bold
            mt-2
            text-green-400
          ">
            {totalClientes}
          </h2>

        </div>


        {/* NO CLIENTES */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
        ">

          <p className="text-yellow-400">
            🟡 No Clientes
          </p>

          <h2 className="
            text-4xl
            font-bold
            mt-2
            text-yellow-400
          ">
            {totalNoClientes}
          </h2>

        </div>


        {/* ADMINISTRADORES */}

        <div className="
          bg-slate-800
          rounded-2xl
          p-6
          border
          border-slate-700
        ">

          <p className="text-blue-400">
            🛡️ Administradores
          </p>

          <h2 className="
            text-4xl
            font-bold
            mt-2
            text-blue-400
          ">
            {totalAdmins}
          </h2>

        </div>

      </div>


      {/* ==========================
          BUSCADOR
      ========================== */}

      <div className="mb-5">

        <input
          type="text"
          placeholder="🔍 Buscar por nombre o correo..."
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


      {/* ==========================
          CONTADOR
      ========================== */}

      <div className="text-slate-400 mb-4">

        Mostrando{" "}

        <span className="text-white font-semibold">
          {usuariosFiltrados.length}
        </span>

        {" "}de{" "}

        <span className="text-white font-semibold">
          {usuarios.length}
        </span>

        {" "}usuarios

      </div>


      {/* ==================================================
          CELULAR - TARJETAS
      ================================================== */}

      <div className="
        block
        md:hidden
        space-y-4
      ">

        {usuariosFiltrados.length === 0 ? (

          <div className="
            bg-slate-800
            border
            border-slate-700
            rounded-2xl
            p-8
            text-center
            text-slate-400
          ">
            No se encontraron usuarios.
          </div>

        ) : (

          usuariosFiltrados.map((usuario) => {

            const seleccionado =
              usuarioSeleccionado?.id === usuario.id;

            return (
              <div
                key={usuario.id}
                onClick={() =>
                  setUsuarioSeleccionado(usuario)
                }
                className={`
                  bg-slate-800
                  border
                  rounded-2xl
                  overflow-hidden
                  cursor-pointer
                  transition-all
                  duration-200

                  ${
                    seleccionado
                      ? "border-blue-500 bg-blue-900/20"
                      : "border-slate-700 hover:border-slate-600"
                  }
                `}
              >

                {/* CABECERA */}

                <div className="
                  bg-slate-700
                  px-5
                  py-4
                  flex
                  justify-between
                  items-start
                  gap-3
                ">

                  <div className="min-w-0">

                    <p className="
                      text-blue-400
                      text-xs
                      uppercase
                      font-semibold
                    ">
                      Usuario
                    </p>

                    <h2 className="
                      text-xl
                      font-bold
                      text-white
                      mt-1
                      break-words
                    ">
                      {usuario.nombre}
                    </h2>

                  </div>


                  {/* ROL */}

                  {usuario.rol === "admin" ? (

                    <span className="
                      shrink-0
                      px-3
                      py-1
                      rounded-full
                      bg-purple-500/20
                      text-purple-400
                      text-xs
                      font-bold
                    ">
                      👑 Admin
                    </span>

                  ) : (

                    <span className="
                      shrink-0
                      px-3
                      py-1
                      rounded-full
                      bg-blue-500/20
                      text-blue-400
                      text-xs
                      font-bold
                    ">
                      👤 Usuario
                    </span>

                  )}

                </div>


                {/* INFORMACIÓN */}

                <div className="p-5">

                  <div className="
                    grid
                    grid-cols-1
                    gap-5
                  ">

                    {/* CORREO */}

                    <div>
                      <p className="text-slate-500 text-sm">
                        Correo
                      </p>

                      <p className="
                        text-slate-200
                        mt-1
                        break-all
                      ">
                        {usuario.correo || "Sin correo"}
                      </p>
                    </div>


                    {/* TELÉFONO */}

                    <div>
                      <p className="text-slate-500 text-sm">
                        Teléfono
                      </p>

                      <p className="
                        text-slate-200
                        mt-1
                      ">
                        {usuario.telefono || "Sin teléfono"}
                      </p>
                    </div>


                    {/* ESTADO */}

                    <div>

                      <p className="
                        text-slate-500
                        text-sm
                        mb-2
                      ">
                        Estado
                      </p>

                      {usuario.es_cliente ? (

                        <span className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          bg-green-500/20
                          text-green-400
                          text-xs
                          font-bold
                        ">
                          🟢 Cliente
                        </span>

                      ) : (

                        <span className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          bg-yellow-500/20
                          text-yellow-400
                          text-xs
                          font-bold
                        ">
                          ⚪ No Cliente
                        </span>

                      )}

                    </div>

                  </div>


                  {/* SEPARADOR */}

                  <div className="
                    border-t
                    border-slate-700
                    mt-5
                    pt-5
                  ">

                    {/* BOTÓN */}

                    {usuario.es_cliente ? (

                      <button
                        type="button"
                        disabled
                        className="
                          w-full
                          bg-green-600/70
                          text-white
                          px-5
                          py-3
                          rounded-xl
                          font-semibold
                          cursor-not-allowed
                        "
                      >
                        ✔ Ya es cliente
                      </button>

                    ) : (

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirConvertirCliente(usuario);
                        }}
                        className="
                          w-full
                          bg-blue-600
                          hover:bg-blue-700
                          transition
                          px-5
                          py-3
                          rounded-xl
                          font-semibold
                          text-white
                        "
                      >
                        ➕ Convertir en cliente
                      </button>

                    )}

                  </div>


                  {/* SELECCIÓN */}

                  <div className="
                    border-t
                    border-slate-700
                    mt-4
                    pt-4
                    flex
                    justify-between
                    items-center
                    text-slate-500
                    text-sm
                  ">

                    <span>
                      Toca para seleccionar
                    </span>

                    <span className="text-xl">
                      →
                    </span>

                  </div>

                </div>

              </div>
            );
          })

        )}

      </div>


      {/* ==================================================
          ESCRITORIO - TABLA
      ================================================== */}

      <div className="
        hidden
        md:block
        bg-slate-800
        rounded-2xl
        shadow-2xl
        overflow-hidden
        border
        border-slate-700
      ">

        <table className="w-full">

          <thead className="bg-slate-700">

            <tr className="text-left text-white">

              <th className="p-4">
                Nombre
              </th>

              <th className="p-4">
                Correo
              </th>

              <th className="p-4">
                Teléfono
              </th>

              <th className="p-4">
                Rol
              </th>

              <th className="p-4">
                Cliente
              </th>

              <th className="p-4 text-center">
                Acción
              </th>

            </tr>

          </thead>


          <tbody>

            {usuariosFiltrados.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="
                    text-center
                    p-10
                    text-slate-400
                  "
                >
                  No se encontraron usuarios.
                </td>

              </tr>

            ) : (

              usuariosFiltrados.map((usuario) => (

                <tr
                  key={usuario.id}
                  onClick={() =>
                    setUsuarioSeleccionado(usuario)
                  }
                  className={`
                    border-t
                    border-slate-700
                    cursor-pointer
                    transition-all

                    ${
                      usuarioSeleccionado?.id === usuario.id
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
                    {usuario.nombre}
                  </td>


                  <td className="
                    p-4
                    text-slate-300
                  ">
                    {usuario.correo}
                  </td>


                  <td className="
                    p-4
                    text-slate-300
                  ">
                    {usuario.telefono || "-"}
                  </td>


                  <td className="p-4">

                    {usuario.rol === "admin" ? (

                      <span className="
                        px-3
                        py-1
                        rounded-full
                        bg-purple-500/20
                        text-purple-400
                        text-xs
                        font-bold
                      ">
                        👑 Administrador
                      </span>

                    ) : (

                      <span className="
                        px-3
                        py-1
                        rounded-full
                        bg-blue-500/20
                        text-blue-400
                        text-xs
                        font-bold
                      ">
                        👤 Usuario
                      </span>

                    )}

                  </td>


                  <td className="p-4">

                    {usuario.es_cliente ? (

                      <span className="
                        px-3
                        py-1
                        rounded-full
                        bg-green-500/20
                        text-green-400
                        text-xs
                        font-bold
                      ">
                        🟢 Cliente
                      </span>

                    ) : (

                      <span className="
                        px-3
                        py-1
                        rounded-full
                        bg-yellow-500/20
                        text-yellow-400
                        text-xs
                        font-bold
                      ">
                        ⚪ No Cliente
                      </span>

                    )}

                  </td>


                  <td className="
                    p-4
                    text-center
                  ">

                    {usuario.es_cliente ? (

                      <button
                        type="button"
                        disabled
                        className="
                          bg-green-600
                          text-white
                          px-5
                          py-2
                          rounded-xl
                          font-semibold
                          opacity-70
                          cursor-not-allowed
                        "
                      >
                        ✔ Cliente
                      </button>

                    ) : (

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirConvertirCliente(usuario);
                        }}
                        className="
                          bg-blue-600
                          hover:bg-blue-700
                          transition
                          px-5
                          py-2
                          rounded-xl
                          font-semibold
                        "
                      >
                        ➕ Convertir
                      </button>

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* ==========================
          CONFIRMAR CONVERSIÓN
      ========================== */}

      <ConfirmModal
        open={mostrarConfirmacion}
        title="¿Convertir en cliente?"
        message="Se creará un nuevo registro en el módulo Clientes."
        subMessage={`Usuario: ${
          usuarioAConvertir?.nombre ?? ""
        }`}
        icon="question"
        color="blue"
        confirmText="Sí, convertir"
        cancelText="Cancelar"
        onConfirm={convertirCliente}
        onCancel={() => {
          setMostrarConfirmacion(false);
          setUsuarioAConvertir(null);
        }}
      />

    </div>
  );
}