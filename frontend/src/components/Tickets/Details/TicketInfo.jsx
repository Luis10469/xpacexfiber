import { useState } from "react";

const TicketInfo = ({
  ticketSeleccionado,
}) => {

  const [mostrarInformacion, setMostrarInformacion] = useState(false);

  // ======================================
  // SIN TICKET SELECCIONADO
  // ======================================

  if (!ticketSeleccionado) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            Información
          </h2>
        </div>

        <div className="text-center text-slate-400 py-10">
          Selecciona un ticket.
        </div>

      </div>
    );
  }

  // ======================================
  // INFORMACIÓN DEL TICKET
  // ======================================

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">

      {/* ======================================
          BOTÓN DESPLEGABLE
      ====================================== */}

      <button
        type="button"
        onClick={() =>
          setMostrarInformacion(!mostrarInformacion)
        }
        className="
          w-full
          flex
          items-center
          justify-between
          p-5
          text-left
          hover:bg-slate-700
          transition
        "
      >

        <div className="flex items-center gap-3">

          <span className="text-2xl">
            👤
          </span>

          <div>

            <h2 className="text-xl font-bold text-white">
              Información
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {mostrarInformacion
                ? "Ocultar información"
                : "Ver información del ticket"}
            </p>

          </div>

        </div>

        {/* ICONO */}

        <span
          className="
            text-2xl
            text-slate-400
            transition-transform
            duration-300
          "
        >
          {mostrarInformacion ? "⌃" : "⌄"}
        </span>

      </button>


      {/* ======================================
          INFORMACIÓN DESPLEGABLE
      ====================================== */}

      {mostrarInformacion && (

        <div
          className="
            border-t
            border-slate-700
            p-5
            space-y-5
          "
        >

          <Info
            titulo="Cliente"
            valor={ticketSeleccionado.cliente}
          />

          <Info
            titulo="Correo"
            valor={ticketSeleccionado.correo}
          />

          <Info
            titulo="Teléfono"
            valor={ticketSeleccionado.telefono}
          />

          <Info
            titulo="Plan"
            valor={ticketSeleccionado.plan}
          />

          <Info
            titulo="Zona"
            valor={ticketSeleccionado.zona}
          />

          <Info
            titulo="Asunto"
            valor={ticketSeleccionado.asunto}
          />

          <Info
            titulo="Categoría"
            valor={ticketSeleccionado.categoria}
          />

          <Info
            titulo="Estado"
            valor={ticketSeleccionado.estado}
          />

          <Info
            titulo="Prioridad"
            valor={ticketSeleccionado.prioridad}
          />

          <Info
            titulo="Técnico"
            valor={
              ticketSeleccionado.tecnico ||
              "Sin asignar"
            }
          />

          <Info
            titulo="Fecha"
            valor={
              ticketSeleccionado.fecha_creacion
                ? new Date(
                    ticketSeleccionado.fecha_creacion
                  ).toLocaleString("es-CO")
                : "-"
            }
          />

          <Info
            titulo="Última actualización"
            valor={
              ticketSeleccionado.fecha_actualizacion
                ? new Date(
                    ticketSeleccionado.fecha_actualizacion
                  ).toLocaleString("es-CO")
                : "-"
            }
          />

        </div>

      )}

    </div>
  );
};


// ======================================
// COMPONENTE INFO
// ======================================

const Info = ({
  titulo,
  valor,
}) => {

  return (

    <div>

      <p className="text-sm text-slate-400 mb-1">
        {titulo}
      </p>

      <p className="font-semibold text-white break-words">
        {valor || "-"}
      </p>

    </div>

  );
};

export default TicketInfo;