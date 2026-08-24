import { useState } from "react";

const formularioInicial = {
  asunto: "",
  descripcion: "",
  categoria: "Soporte general",
  prioridad: "Media",
};

const NuevoTicketModal = ({ abierto, onCerrar, onCrear, cargando }) => {
  const [form, setForm] = useState(formularioInicial);

  if (!abierto) return null;

  const actualizarCampo = (campo, valor) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const cerrarYLimpiar = () => {
    setForm(formularioInicial);
    onCerrar();
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    const exito = await onCrear(form);

    if (exito) {
      setForm(formularioInicial);
    }
  };

  return (
    <div
      onClick={() => !cargando && cerrarYLimpiar()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl"
      >

        {/* CABECERA */}

        <div className="flex items-center justify-between p-6 pb-5">

          <div>
            <h2 className="text-xl font-bold text-white">
              Nueva solicitud
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Describe el problema que necesitas reportar.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarYLimpiar}
            className="
              rounded-lg
              px-3
              py-2
              text-slate-400
              transition
              hover:bg-slate-700
              hover:text-white
            "
          >
            ✕
          </button>

        </div>

        {/* FORMULARIO */}

        <form onSubmit={handleSubmit} className="px-6 pb-6">

          <div className="grid gap-3 md:grid-cols-2">

            <input
              required
              value={form.asunto}
              onChange={(e) => actualizarCampo("asunto", e.target.value)}
              placeholder="Asunto"
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                p-3
                text-white
                outline-none
                placeholder:text-slate-400
                focus:border-blue-500
              "
            />

            <select
              value={form.categoria}
              onChange={(e) => actualizarCampo("categoria", e.target.value)}
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                p-3
                text-white
                outline-none
                focus:border-blue-500
              "
            >
              <option>Soporte general</option>
              <option>Conexión</option>
              <option>Facturación</option>
              <option>Instalación</option>
            </select>

          </div>

          <textarea
            required
            value={form.descripcion}
            onChange={(e) => actualizarCampo("descripcion", e.target.value)}
            placeholder="Describe lo que necesitas"
            className="
              mt-3
              min-h-28
              w-full
              resize-y
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              p-3
              text-white
              outline-none
              placeholder:text-slate-400
              focus:border-blue-500
            "
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <select
              value={form.prioridad}
              onChange={(e) => actualizarCampo("prioridad", e.target.value)}
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                p-3
                text-white
                outline-none
              "
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
            </select>

            <button
              type="submit"
              disabled={cargando}
              className="
                rounded-xl
                bg-blue-600
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {cargando ? "Creando..." : "Crear ticket"}
            </button>

            <button
              type="button"
              onClick={cerrarYLimpiar}
              className="
                rounded-xl
                border
                border-slate-600
                px-5
                py-3
                font-semibold
                text-slate-300
                transition
                hover:bg-slate-700
                hover:text-white
              "
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default NuevoTicketModal;
