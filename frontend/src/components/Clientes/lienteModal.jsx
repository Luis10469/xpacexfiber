const ClienteModal = ({
  mostrarModal,
  modoEdicion,
  formulario,
  setFormulario,
  guardarCliente,
  setMostrarModal,
  planes,
  zonas,
}) => {
  if (!mostrarModal) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
        overflow-y-auto
      "
    >
      <div
        className="
          relative
          w-full
          max-w-5xl
          max-h-[95vh]
          overflow-y-auto

          bg-slate-800
          border
          border-slate-700
          rounded-3xl

          p-6
          md:p-10

          shadow-2xl
        "
      >
        {/* =========================
            ENCABEZADO
        ========================== */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
              Administración
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-white mt-1">
              {modoEdicion ? "Editar Cliente" : "Nuevo Cliente"}
            </h2>

            <p className="text-slate-400 mt-2">
              {modoEdicion
                ? "Actualiza la información del cliente."
                : "Registra un nuevo cliente en WiFiConnect."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarModal(false)}
            className="
              flex
              items-center
              justify-center
              w-10
              h-10

              rounded-xl

              text-2xl
              text-slate-400

              hover:bg-slate-700
              hover:text-white

              transition
            "
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* =========================
            FORMULARIO
        ========================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* NOMBRE */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Nombre
            </label>

            <input
              type="text"
              value={formulario.nombre || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  nombre: e.target.value,
                })
              }
              placeholder="Nombre completo"
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* CORREO */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Correo
            </label>

            <input
              type="email"
              value={formulario.correo || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  correo: e.target.value,
                })
              }
              placeholder="correo@ejemplo.com"
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Teléfono
            </label>

            <input
              type="text"
              value={formulario.telefono || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  telefono: e.target.value,
                })
              }
              placeholder="300 000 0000"
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* DIRECCIÓN */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Dirección
            </label>

            <input
              type="text"
              value={formulario.direccion || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  direccion: e.target.value,
                })
              }
              placeholder="Dirección de instalación"
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            />
          </div>

          {/* PLAN */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Plan
            </label>

            <select
              value={formulario.plan_id || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  plan_id: e.target.value,
                })
              }
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            >
              <option value="">Seleccione un plan</option>

              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ZONA */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Zona
            </label>

            <select
              value={formulario.zona_id || ""}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  zona_id: e.target.value,
                })
              }
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            >
              <option value="">Seleccione una zona</option>

              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ESTADO */}
          <div>
            <label className="block mb-2 text-slate-300 font-semibold">
              Estado
            </label>

            <select
              value={formulario.estado || "activo"}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  estado: e.target.value,
                })
              }
              className="
                w-full
                bg-slate-900
                text-white
                rounded-xl
                px-5
                py-4
                border
                border-slate-600
                outline-none

                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
              "
            >
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>

        {/* =========================
            BOTONES
        ========================== */}

        <div
          className="
            flex
            flex-col-reverse
            sm:flex-row
            justify-end
            gap-3
            mt-10
            pt-6
            border-t
            border-slate-700
          "
        >
          <button
            type="button"
            onClick={() => setMostrarModal(false)}
            className="
              px-6
              py-3
              rounded-xl

              bg-slate-700
              hover:bg-slate-600

              text-white
              font-semibold

              transition
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardarCliente}
            className="
              px-6
              py-3
              rounded-xl

              bg-blue-600
              hover:bg-blue-700

              text-white
              font-semibold

              shadow-lg
              hover:shadow-blue-500/20

              transition
            "
          >
            {modoEdicion ? "Actualizar Cliente" : "Guardar Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;