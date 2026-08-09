import { useState } from "react";

import TicketList from "../Sidebar/TicketList";
import TicketConversation from "../Conversation/TicketConversation";
import TicketInfo from "../Details/TicketInfo";
import TicketActions from "../Details/TicketActions";

const TicketLayoutMobile = ({
  tickets = [],
  ticketSeleccionado,
  setTicketSeleccionado,
  seleccionarTicket,
  cargarTickets,

  mensajes = [],
  cargarMensajes,
  enviarMensajeTicket,

  tecnicos = [],
  editarTicket,
  puedeGestionar = true,
  usuarioActual,
}) => {

  // =====================================================
  // ESTADOS MÓVILES
  // =====================================================

  const [vista, setVista] = useState("lista");

  const [menuAbierto, setMenuAbierto] = useState(false);

  const [panelAbierto, setPanelAbierto] = useState(null);


  // =====================================================
  // SELECCIONAR TICKET
  // =====================================================

  const seleccionarTicketMovil = (ticket) => {

    if (seleccionarTicket) {
      seleccionarTicket(ticket);
    } else {
      setTicketSeleccionado(ticket);
    }

    setVista("conversacion");

    setMenuAbierto(false);

    setPanelAbierto(null);
  };


  // =====================================================
  // VOLVER A TICKETS
  // =====================================================

  const volverTickets = () => {

    setVista("lista");

    setMenuAbierto(false);

    setPanelAbierto(null);
  };


  // =====================================================
  // ABRIR INFORMACIÓN
  // =====================================================

  const abrirInformacion = () => {

    setMenuAbierto(false);

    setPanelAbierto("informacion");
  };


  // =====================================================
  // ABRIR GESTIÓN
  // =====================================================

  const abrirGestion = () => {

    setMenuAbierto(false);

    setPanelAbierto("gestion");
  };


  // =====================================================
  // CERRAR PANEL
  // =====================================================

  const cerrarPanel = () => {

    setPanelAbierto(null);
  };


  return (

    <div
      className="
        w-full
        min-h-[650px]
        relative
      "
    >

      {/* =====================================================
          📱 LISTA DE TICKETS
      ===================================================== */}

      {vista === "lista" && (

        <div
          className="
            w-full
            min-h-[650px]
          "
        >

          <div
            className="
              w-full
              min-h-[650px]
              rounded-xl
              border
              border-slate-700
              bg-slate-900/70
              overflow-hidden
            "
          >

            <TicketList
              tickets={tickets}
              ticketSeleccionado={ticketSeleccionado}
              setTicketSeleccionado={setTicketSeleccionado}
              seleccionarTicket={seleccionarTicketMovil}
              cargarTickets={cargarTickets}
            />

          </div>

        </div>

      )}


      {/* =====================================================
          📱 CONVERSACIÓN
      ===================================================== */}

      {vista === "conversacion" && (

        <div
          className="
            w-full
            min-h-[650px]
            relative
          "
        >

          <div
            className="
              relative
              w-full
              min-h-[650px]
              rounded-xl
              border
              border-slate-700
              bg-slate-900/70
              flex
              flex-col
            "
          >

            {/* =================================================
                CABECERA
            ================================================= */}

            <div
              className="
                relative
                z-30
                h-16
                min-h-16
                shrink-0
                flex
                items-center
                justify-between
                px-4
                border-b
                border-slate-700
                bg-slate-800
                rounded-t-xl
              "
            >

              {/* VOLVER */}

              <button
                type="button"
                onClick={volverTickets}
                className="
                  flex
                  items-center
                  gap-2
                  text-slate-300
                  hover:text-white
                  transition
                "
              >

                <span className="text-3xl leading-none">
                  ←
                </span>

                <span className="font-semibold text-lg">
                  Tickets
                </span>

              </button>


              {/* =================================================
                  BOTÓN TRES PUNTOS
              ================================================= */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {

                    setMenuAbierto((actual) => !actual);

                    setPanelAbierto(null);

                  }}
                  className="
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-slate-700
                    hover:bg-slate-600
                    text-white
                    transition
                  "
                >

                  <span
                    className="
                      text-3xl
                      leading-none
                      -mt-2
                    "
                  >
                    ⋮
                  </span>

                </button>


                {/* =================================================
                    MENÚ
                ================================================= */}

                {menuAbierto && (

                  <div
                    className="
                      absolute
                      right-0
                      top-14
                      z-[100]
                      w-56
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-600
                      bg-slate-800
                      shadow-2xl
                    "
                  >

                    {/* INFORMACIÓN */}

                    <button
                      type="button"
                      onClick={abrirInformacion}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-5
                        py-4
                        text-left
                        text-white
                        hover:bg-slate-700
                        transition
                      "
                    >

                      <span className="text-xl">
                        ℹ️
                      </span>

                      <span className="font-medium">
                        Información
                      </span>

                    </button>


                    {/* GESTIÓN */}

                    {puedeGestionar && (

                      <button
                        type="button"
                        onClick={abrirGestion}
                        className="
                          w-full
                          flex
                          items-center
                          gap-3
                          px-5
                          py-4
                          text-left
                          text-white
                          hover:bg-slate-700
                          transition
                          border-t
                          border-slate-700
                        "
                      >

                        <span className="text-xl">
                          ⚙️
                        </span>

                        <span className="font-medium">
                          Gestión
                        </span>

                      </button>

                    )}

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                CONVERSACIÓN
            ================================================= */}

            <div
              className="
                relative
                w-full
                flex-1
                min-h-[584px]
              "
            >

              <TicketConversation
                ticketSeleccionado={ticketSeleccionado}
                mensajes={mensajes}
                cargarMensajes={cargarMensajes}
                enviarMensajeTicket={enviarMensajeTicket}
                usuarioActual={usuarioActual}
              />

            </div>


            {/* =================================================
                PANEL INFORMACIÓN
            ================================================= */}

            {panelAbierto === "informacion" && (

              <div
                className="
                  absolute
                  inset-0
                  z-[80]
                  rounded-xl
                  bg-slate-950
                  overflow-y-auto
                "
              >

                <div className="min-h-full">

                  {/* CABECERA */}

                  <div
                    className="
                      sticky
                      top-0
                      z-10
                      h-16
                      flex
                      items-center
                      justify-between
                      px-5
                      border-b
                      border-slate-700
                      bg-slate-800
                    "
                  >

                    <h2 className="text-xl font-bold text-white">
                      Información
                    </h2>

                    <button
                      type="button"
                      onClick={cerrarPanel}
                      className="
                        w-10
                        h-10
                        rounded-lg
                        bg-slate-700
                        hover:bg-slate-600
                        text-white
                        text-xl
                      "
                    >
                      ✕
                    </button>

                  </div>


                  {/* DATOS */}

                  <div className="p-5">

                    <TicketInfo
                      ticketSeleccionado={ticketSeleccionado}
                    />

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                PANEL GESTIÓN
            ================================================= */}

            {panelAbierto === "gestion" && puedeGestionar && (

              <div
                className="
                  absolute
                  inset-0
                  z-[80]
                  rounded-xl
                  bg-slate-950
                  overflow-y-auto
                "
              >

                <div className="min-h-full">

                  {/* CABECERA */}

                  <div
                    className="
                      sticky
                      top-0
                      z-10
                      h-16
                      flex
                      items-center
                      justify-between
                      px-5
                      border-b
                      border-slate-700
                      bg-slate-800
                    "
                  >

                    <h2 className="text-xl font-bold text-white">
                      Gestión
                    </h2>

                    <button
                      type="button"
                      onClick={cerrarPanel}
                      className="
                        w-10
                        h-10
                        rounded-lg
                        bg-slate-700
                        hover:bg-slate-600
                        text-white
                        text-xl
                      "
                    >
                      ✕
                    </button>

                  </div>


                  {/* GESTIÓN */}

                  <div className="p-5">

                    <TicketActions
                      ticketSeleccionado={ticketSeleccionado}
                      tecnicos={tecnicos}
                      editarTicket={editarTicket}
                    />

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

};

export default TicketLayoutMobile;