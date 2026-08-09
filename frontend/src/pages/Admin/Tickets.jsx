import TicketHeader from "../../components/Tickets/Header/TicketHeader";
import TicketStats from "../../components/Tickets/Stats/TicketStats";

import TicketLayout from "../../components/Tickets/Layout/TicketLayout";
import TicketLayoutMobile from "../../components/Tickets/Layout/TicketLayoutMobile";

import useTickets from "../../components/Tickets/hooks/useTickets";
import { useAuth } from "../../context/AuthContext";

const TicketsAdmin = () => {
  const { user } = useAuth();
  const {
    // ==============================
    // DATOS
    // ==============================
    tickets,
    ticketSeleccionado,
    dashboard,
    mensajes,
    historial,
    tecnicos,

    // ==============================
    // ESTADOS
    // ==============================
    cargando,
    error,

    // ==============================
    // TICKETS
    // ==============================
    setTicketSeleccionado,
    seleccionarTicket,
    cargarTickets,
    editarTicket,

    // ==============================
    // MENSAJES
    // ==============================
    cargarMensajes,
    enviarMensajeTicket,
  } = useTickets();

  return (
    <div className="w-full min-h-screen">

      {/* ==============================
          ENCABEZADO
      ============================== */}
      <div className="mb-8">
        <TicketHeader />
      </div>

      {/* ==============================
          ERROR
      ============================== */}
      {error && (
        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            p-4
            text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* ==============================
          ESTADÍSTICAS
      ============================== */}
      <div className="mb-8 w-full overflow-x-auto">
         <div className="flex min-w-max gap-4">
        <TicketStats dashboard={dashboard} />
       </div>
    </div>

      {/* ==============================
          CARGANDO
      ============================== */}
      {cargando && (
        <div
          className="
            mb-6
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            p-4
            text-center
            text-slate-400
          "
        >
          Cargando tickets...
        </div>
      )}

      {/* ==============================
          CONTENIDO PRINCIPAL
      ============================== */}
      <div className="w-full min-h-[650px]">

  {/* =================================================
      📱 MÓVIL
      Solo aparece en pantallas pequeñas
  ================================================= */}

  <div className="lg:hidden w-full h-[650px] min-h-0">

    <TicketLayoutMobile
      tickets={tickets}
      ticketSeleccionado={ticketSeleccionado}
      setTicketSeleccionado={setTicketSeleccionado}
      seleccionarTicket={seleccionarTicket}
      cargarTickets={cargarTickets}

      mensajes={mensajes}
      cargarMensajes={cargarMensajes}
      enviarMensajeTicket={enviarMensajeTicket}

      tecnicos={tecnicos}
      editarTicket={editarTicket}
      puedeGestionar={true}
      usuarioActual={user}
    />

  </div>


  {/* =================================================
      💻 PC
      NO TOCAMOS SU ESTRUCTURA
  ================================================= */}

  <div className="hidden lg:block w-full h-[650px]">

    <TicketLayout
      tickets={tickets}
      ticketSeleccionado={ticketSeleccionado}
      setTicketSeleccionado={setTicketSeleccionado}
      seleccionarTicket={seleccionarTicket}
      cargarTickets={cargarTickets}
      mensajes={mensajes}
      cargarMensajes={cargarMensajes}
      enviarMensajeTicket={enviarMensajeTicket}
      tecnicos={tecnicos}
      editarTicket={editarTicket}
      usuarioActual={user}
      historial={historial}
    />

  </div>

</div>

    </div>
  );
};

export default TicketsAdmin;
