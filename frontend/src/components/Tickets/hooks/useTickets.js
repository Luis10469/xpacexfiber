import { useCallback, useEffect, useState } from "react";

import {
  obtenerTickets,
  obtenerDashboard,
  obtenerTicketPorId,
  crearTicket,
  actualizarTicket,
  eliminarTicket,
  obtenerMensajes,
  enviarMensaje,
  obtenerHistorial,
  obtenerTecnicos,
} from "../services/ticketService";

const useTickets = ({ modoAdmin = true } = {}) => {

  // ======================================
  // ESTADOS
  // ======================================

  const [tickets, setTickets] = useState([]);
  const [ticketSeleccionado, setTicketSeleccionado] =
    useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [mensajes, setMensajes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);


  // ======================================
  // MANEJAR ERRORES
  // ======================================

  const manejarError = (error, mensaje) => {
    console.error(mensaje, error);

    setError(
      error?.response?.data?.message || mensaje
    );
  };


  // ======================================
  // OBTENER TICKETS
  // ======================================

  const cargarTickets = useCallback(
    async (filtros = {}) => {
      try {
        setCargando(true);
        setError(null);

        const resultado =
          await obtenerTickets(filtros);

        setTickets(resultado || []);

        return resultado || [];
      } catch (error) {
        manejarError(
          error,
          "No se pudieron cargar los tickets."
        );

        throw error;
      } finally {
        setCargando(false);
      }
    },
    []
  );


  // ======================================
  // OBTENER DASHBOARD
  // ======================================

  const cargarDashboard = useCallback(
    async () => {
      try {
        const resultado =
          await obtenerDashboard();

        setDashboard(resultado || null);

        return resultado || null;
      } catch (error) {
        manejarError(
          error,
          "No se pudo cargar el dashboard."
        );

        return null;
      }
    },
    []
  );


  // ======================================
  // SELECCIONAR TICKET
  // ======================================

  const seleccionarTicket = useCallback(
    async (id) => {
      if (!id) return null;

      try {
        setError(null);

        const ticket =
          await obtenerTicketPorId(id);

        setTicketSeleccionado(ticket);

        return ticket;
      } catch (error) {
        manejarError(
          error,
          "No se pudo obtener el ticket."
        );

        return null;
      }
    },
    []
  );


  // ======================================
  // CREAR TICKET
  // ======================================

  const agregarTicket = async (datos) => {
    try {
      setError(null);

      const resultado =
        await crearTicket(datos);

      await cargarTickets();
      await cargarDashboard();

      return resultado;
    } catch (error) {
      manejarError(
        error,
        "No se pudo crear el ticket."
      );

      return null;
    }
  };


  // ======================================
  // ACTUALIZAR TICKET
  // ======================================

  const editarTicket = async (id, datos) => {
    try {
      setError(null);

      const resultado =
        await actualizarTicket(id, datos);

      // Actualizar lista
      await cargarTickets();

      // Actualizar estadísticas
      await cargarDashboard();

      // Actualizar ticket seleccionado
      if (ticketSeleccionado?.id === id) {
        const actualizado =
          await obtenerTicketPorId(id);

        setTicketSeleccionado(actualizado);
      }

      return resultado;
    } catch (error) {
      manejarError(
        error,
        "No se pudo actualizar el ticket."
      );

      return null;
    }
  };


  // ======================================
  // ELIMINAR TICKET
  // ======================================

  const borrarTicket = async (id) => {
    try {
      setError(null);

      await eliminarTicket(id);

      setTickets((actuales) =>
        actuales.filter(
          (ticket) => ticket.id !== id
        )
      );

      if (ticketSeleccionado?.id === id) {
        setTicketSeleccionado(null);
        setMensajes([]);
        setHistorial([]);
      }

      await cargarDashboard();

      return true;
    } catch (error) {
      manejarError(
        error,
        "No se pudo eliminar el ticket."
      );

      return false;
    }
  };


  // ======================================
  // OBTENER MENSAJES
  // ======================================

  const cargarMensajes = useCallback(
    async (ticketId) => {
      if (!ticketId) {
        setMensajes([]);
        return [];
      }

      try {
        const resultado =
          await obtenerMensajes(ticketId);

        setMensajes(resultado || []);

        return resultado || [];
      } catch (error) {
        manejarError(
          error,
          "No se pudieron cargar los mensajes."
        );

        setMensajes([]);

        return [];
      }
    },
    []
  );


  // ======================================
  // ENVIAR MENSAJE
  // ======================================

  const enviarMensajeTicket = async (
    ticketId,
    mensaje
  ) => {
    if (
      !ticketId ||
      !mensaje?.trim()
    ) {
      return false;
    }

    try {
      setError(null);

      await enviarMensaje(
        ticketId,
        mensaje.trim()
      );

      // Recargar conversación
      await cargarMensajes(ticketId);
      await cargarTickets();
      await cargarDashboard();

      if (ticketSeleccionado?.id === ticketId) {
        const actualizado = await obtenerTicketPorId(ticketId);
        setTicketSeleccionado(actualizado);
      }

      return true;
    } catch (error) {
      manejarError(
        error,
        "No se pudo enviar el mensaje."
      );

      return false;
    }
  };


  // ======================================
  // OBTENER HISTORIAL
  // ======================================

  const cargarHistorial = useCallback(
    async (ticketId) => {
      if (!ticketId) {
        setHistorial([]);
        return [];
      }

      try {
        const resultado =
          await obtenerHistorial(ticketId);

        setHistorial(resultado || []);

        return resultado || [];
      } catch (error) {
        manejarError(
          error,
          "No se pudo cargar el historial."
        );

        setHistorial([]);

        return [];
      }
    },
    []
  );


  // ======================================
  // OBTENER TÉCNICOS
  // ======================================

  const cargarTecnicos = useCallback(
    async () => {
      try {
        const resultado =
          await obtenerTecnicos();

        setTecnicos(resultado || []);

        return resultado || [];
      } catch (error) {
        manejarError(
          error,
          "No se pudieron cargar los técnicos."
        );

        setTecnicos([]);

        return [];
      }
    },
    []
  );


  // ======================================
  // CARGA INICIAL
  // ======================================

  useEffect(() => {
    cargarTickets();
    cargarDashboard();
    if (modoAdmin) cargarTecnicos();
  }, [
    cargarTickets,
    cargarDashboard,
    cargarTecnicos,
    modoAdmin,
  ]);


  // ======================================
  // CARGAR MENSAJES AL SELECCIONAR TICKET
  // ======================================
useEffect(() => {
  if (!ticketSeleccionado?.id) {
    setMensajes([]);
    return;
  }

  const ticketId = ticketSeleccionado.id;

  // Cargar inmediatamente
  cargarMensajes(ticketId);
  cargarHistorial(ticketId);

  // Actualizar mensajes cada 3 segundos
  const intervalo = setInterval(() => {
    cargarMensajes(ticketId);
  }, 3000);

  // Limpiar cuando se cambia de ticket
  return () => {
    clearInterval(intervalo);
  };
}, [
  ticketSeleccionado?.id,
  cargarMensajes,
  cargarHistorial,
]);
  // ======================================
  // RETORNO
  // ======================================

  return {

    // Datos
    tickets,
    ticketSeleccionado,
    dashboard,
    mensajes,
    historial,
    tecnicos,

    // Estados
    cargando,
    error,

    // Tickets
    cargarTickets,
    cargarDashboard,
    seleccionarTicket,
    setTicketSeleccionado,

    agregarTicket,
    editarTicket,
    borrarTicket,

    // Mensajes
    cargarMensajes,
    enviarMensajeTicket,

    // Historial
    cargarHistorial,

    // Técnicos
    cargarTecnicos,

    // Error
    setError,
  };
};

export default useTickets;
