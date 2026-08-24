const formatearFecha = (fecha) => {
  if (!fecha) return "";

  return new Date(fecha).toLocaleString("es-CO");
};

const NuevasNoticiasModal = ({ open, notificaciones, marcarLeida, marcarTodas, onClose }) => {

  if (!open) return null;

  const noLeidas = notificaciones.filter((n) => !n.leido);

  if (!noLeidas.length) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] flex flex-col bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl"
      >

        <div className="flex justify-between items-start p-8 pb-4 shrink-0">

          <div>
            <p className="text-blue-400 uppercase tracking-widest font-semibold text-sm">
              Novedades
            </p>

            <h2 className="text-2xl font-black text-white mt-1">
              Tienes {noLeidas.length} {noLeidas.length === 1 ? "noticia nueva" : "noticias nuevas"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-4">

          {noLeidas.map((n) => (
            <div
              key={n.id}
              className="bg-slate-900 border border-slate-700 rounded-xl p-5"
            >

              <h3 className="font-bold text-white text-lg">
                {n.titulo}
              </h3>

              <p className="text-slate-300 mt-2 whitespace-pre-line">
                {n.mensaje}
              </p>

              <div className="flex justify-between items-center mt-4">

                <span className="text-xs text-slate-500">
                  {formatearFecha(n.created_at)}
                </span>

                <button
                  type="button"
                  onClick={() => marcarLeida(n.id)}
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    transition
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Marcar como leída
                </button>

              </div>

            </div>
          ))}

        </div>

        <div className="p-8 pt-4 shrink-0">
          <button
            type="button"
            onClick={marcarTodas}
            className="
              w-full
              bg-slate-700
              hover:bg-slate-600
              transition
              py-3
              rounded-xl
              font-semibold
              text-white
            "
          >
            Marcar todas y cerrar
          </button>
        </div>

      </div>

    </div>
  );

};

export default NuevasNoticiasModal;
