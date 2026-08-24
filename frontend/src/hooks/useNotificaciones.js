import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const INTERVALO_POLLING = 60000;

export const useNotificaciones = () => {
  const { user } = useAuth();

  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const { data } = await api.get("/noticias/mias");

      setNotificaciones(data.notificaciones || []);
      setNoLeidas(data.noLeidas || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarLeida = useCallback(
    async (id) => {
      try {
        await api.put(`/noticias/notificaciones/${id}/leido`);

        await refrescar();
      } catch (error) {
        console.error("Error marcando notificación como leída:", error);
      }
    },
    [refrescar]
  );

  const marcarTodas = useCallback(async () => {
    try {
      await api.put("/noticias/notificaciones/leido-todas");

      await refrescar();
    } catch (error) {
      console.error("Error marcando todas las notificaciones:", error);
    }
  }, [refrescar]);

  useEffect(() => {
    if (!user) return;

    refrescar();

    const intervalo = setInterval(refrescar, INTERVALO_POLLING);

    return () => clearInterval(intervalo);
  }, [user, refrescar]);

  return {
    notificaciones,
    noLeidas,
    loading,
    marcarLeida,
    marcarTodas,
    refrescar,
  };
};
