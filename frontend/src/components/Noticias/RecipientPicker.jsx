import { useMemo, useState } from "react";

const RecipientPicker = ({ usuarios, selectedIds, onChange }) => {
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return usuarios.filter((u) => {
      const nombre = (u.nombre || "").toLowerCase();
      const correo = (u.correo || "").toLowerCase();

      return nombre.includes(texto) || correo.includes(texto);
    });
  }, [usuarios, busqueda]);

  const estaSeleccionado = (id) => selectedIds.includes(id);

  const alternarUno = (id) => {
    if (estaSeleccionado(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const seleccionarTodosFiltrados = () => {
    const idsFiltrados = usuariosFiltrados.map((u) => u.id);
    const combinados = new Set([...selectedIds, ...idsFiltrados]);

    onChange([...combinados]);
  };

  const deseleccionarTodosFiltrados = () => {
    const idsFiltrados = new Set(usuariosFiltrados.map((u) => u.id));

    onChange(selectedIds.filter((id) => !idsFiltrados.has(id)));
  };

  const todosFiltradosSeleccionados =
    usuariosFiltrados.length > 0 &&
    usuariosFiltrados.every((u) => estaSeleccionado(u.id));

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-900 overflow-hidden">

      <div className="p-4 border-b border-slate-700">

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
            p-3
            outline-none
            focus:border-blue-500
            text-white
            text-sm
          "
        />

        <div className="flex justify-between items-center mt-3 text-sm">

          <span className="text-slate-400">
            <span className="text-white font-semibold">
              {selectedIds.length}
            </span>
            {" "}seleccionados
          </span>

          <button
            type="button"
            onClick={
              todosFiltradosSeleccionados
                ? deseleccionarTodosFiltrados
                : seleccionarTodosFiltrados
            }
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {todosFiltradosSeleccionados
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
          </button>

        </div>

      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">

        {usuariosFiltrados.length === 0 ? (

          <p className="p-6 text-center text-sm text-slate-400">
            No se encontraron usuarios.
          </p>

        ) : (

          usuariosFiltrados.map((u) => (

            <label
              key={u.id}
              className="
                flex
                items-center
                gap-3
                p-3
                cursor-pointer
                hover:bg-slate-800
                transition
              "
            >

              <input
                type="checkbox"
                checked={estaSeleccionado(u.id)}
                onChange={() => alternarUno(u.id)}
                className="h-4 w-4 accent-blue-600"
              />

              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {u.nombre}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {u.correo}
                </p>
              </div>

            </label>

          ))

        )}

      </div>

    </div>
  );
};

export default RecipientPicker;
