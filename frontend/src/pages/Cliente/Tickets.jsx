import toast from "react-hot-toast";

import TicketLayout from "../../components/Tickets/Layout/TicketLayout";
import TicketLayoutMobile from "../../components/Tickets/Layout/TicketLayoutMobile";
import TicketHeader from "../../components/Tickets/Header/TicketHeader";
import NuevoTicketModal from "../../components/Tickets/Modal/NuevoTicketModal";
import useTickets from "../../components/Tickets/hooks/useTickets";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const Tickets = () => {
  const { user } = useAuth();

  // Controla si se muestra el modal de creación
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const {
    tickets,
    ticketSeleccionado,
    mensajes,
    historial,
    cargando,
    error,

    setTicketSeleccionado,
    seleccionarTicket,
    cargarTickets,
    agregarTicket,

    cargarMensajes,
    enviarMensajeTicket,
  } = useTickets({
    modoAdmin: false,
  });

  // ==========================================
  // CREAR TICKET
  // ==========================================

  const crearTicket = async (form) => {
    const resultado = await agregarTicket(form);

    if (!resultado) return false;

    toast.success("Ticket creado y registrado correctamente");

    setMostrarFormulario(false);

    if (resultado.ticketId) {
      await seleccionarTicket(resultado.ticketId);
    }

    return true;
  };

  return (
    <div className="w-full min-w-0">

      {/* ==========================================
          ENCABEZADO
      ========================================== */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

        <TicketHeader
          titulo="Mis tickets de soporte"
          descripcion="Crea y consulta tus solicitudes; cada conversación queda registrada."
        />

        {/* BOTÓN CREAR TICKET */}

        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-semibold
            text-white
            shadow-lg
            transition-all
            duration-200
            hover:bg-blue-700
            hover:shadow-blue-500/20
          "
        >
          🎫 Crear ticket
        </button>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

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

      {/* ==========================================
          MODAL: CREAR TICKET
      ========================================== */}

      <NuevoTicketModal
        abierto={mostrarFormulario}
        onCerrar={() => setMostrarFormulario(false)}
        onCrear={crearTicket}
        cargando={cargando}
      />

      {/* ==========================================
          LISTA / CONVERSACIÓN DE TICKETS
          MÓVIL: navegación tipo lista -> conversación
          ESCRITORIO: layout de 3 columnas
      ========================================== */}

      <div className="w-full min-h-[650px]">

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
            puedeGestionar={false}
            usuarioActual={user}
          />
        </div>

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
            puedeGestionar={false}
            usuarioActual={user}
            historial={historial}
          />
        </div>

      </div>

    </div>
  );
};

export default Tickets;
