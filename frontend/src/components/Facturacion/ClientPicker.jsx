import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";

const ClientPicker = ({ clientes, selectedId, onSelect }) => {
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return clientes.filter((c) => {
      const nombre = (c.nombre || "").toLowerCase();
      const correo = (c.correo || "").toLowerCase();

      return nombre.includes(texto) || correo.includes(texto);
    });
  }, [clientes, busqueda]);

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-900 overflow-hidden">

      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="
              w-full
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              p-3
              pl-9
              outline-none
              focus:border-blue-500
              text-white
              text-sm
            "
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">

        {clientesFiltrados.length === 0 ? (

          <p className="p-6 text-center text-sm text-slate-400">
            No se encontraron clientes.
          </p>

        ) : (

          clientesFiltrados.map((c) => {

            const seleccionado = c.id === selectedId;

            return (
              <button
                type="button"
                key={c.id}
                onClick={() => onSelect(c)}
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  p-3
                  text-left
                  transition
                  hover:bg-slate-800
                  ${seleccionado ? "bg-blue-900/30" : ""}
                `}
              >

                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    ${seleccionado ? "bg-blue-600" : "bg-slate-700"}
                  `}
                >
                  <User size={16} className="text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {c.nombre}
                  </p>

                  <p className="text-slate-400 text-xs truncate">
                    {c.correo}
                  </p>

                  <p className="text-slate-500 text-xs truncate">
                    {c.nombre_plan || "Sin plan"} · {c.nombre_zona || "Sin zona"} · {c.codigo_contrato}
                  </p>
                </div>

              </button>
            );
          })

        )}

      </div>

    </div>
  );
};

export default ClientPicker;
