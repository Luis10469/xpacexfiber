import { useEffect, useRef, useState } from "react";
import {
  Wifi,
  Download,
  Upload,
  Timer,
  Rocket,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ==========================
// CONFIGURACIÓN DE LA SIMULACIÓN
// ==========================

const DURACION_DESCARGA = 1600;
const DURACION_SUBIDA = 1000;
const DURACION_PING = 400;
const INTERVALO_TICK = 60;

const numeroAleatorio = (min, max) => Math.random() * (max - min) + min;

const SpeedTest = ({ velocidadContratada }) => {
  const [estado, setEstado] = useState("idle"); // idle | testing | done
  const [fase, setFase] = useState(null); // download | upload | ping

  const [descarga, setDescarga] = useState(0);
  const [subida, setSubida] = useState(0);
  const [ping, setPing] = useState(0);

  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // ==========================
  // ANIMAR UN VALOR DE 0 A UN OBJETIVO
  // ==========================

  const animarValor = (objetivo, duracion, onTick, onFinish) => {
    const pasos = Math.max(1, Math.round(duracion / INTERVALO_TICK));
    let paso = 0;

    const tick = () => {
      paso += 1;

      const progreso = Math.min(paso / pasos, 1);
      const suavizado = 1 - Math.pow(1 - progreso, 3);

      onTick(Number((objetivo * suavizado).toFixed(1)));

      if (progreso < 1) {
        const id = setTimeout(tick, INTERVALO_TICK);
        timeoutsRef.current.push(id);
      } else {
        onFinish?.();
      }
    };

    tick();
  };

  // ==========================
  // INICIAR PRUEBA
  // ==========================

  const iniciarPrueba = () => {
    setEstado("testing");
    setDescarga(0);
    setSubida(0);
    setPing(0);

    const base = velocidadContratada > 0 ? velocidadContratada : 200;

    const objetivoDescarga = Math.round(numeroAleatorio(base * 0.85, base * 1.1));
    const objetivoSubida = Math.round(objetivoDescarga * numeroAleatorio(0.15, 0.25));
    const objetivoPing = Math.round(numeroAleatorio(5, 25));

    setFase("download");

    animarValor(objetivoDescarga, DURACION_DESCARGA, setDescarga, () => {
      setFase("upload");

      animarValor(objetivoSubida, DURACION_SUBIDA, setSubida, () => {
        setFase("ping");

        animarValor(objetivoPing, DURACION_PING, setPing, () => {
          setEstado("done");
          setFase(null);
        });
      });
    });
  };

  const midiendo = estado === "testing";

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

      {/* ==========================
          ENCABEZADO
      ========================== */}

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-2">
          <Wifi size={20} className="text-blue-400" />

          <h3 className="text-white font-bold">
            Prueba de velocidad
          </h3>
        </div>

        {estado === "done" && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
            <CheckCircle2 size={14} />
            Prueba completada
          </span>
        )}

        {midiendo && (
          <span className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
            <Loader2 size={14} className="animate-spin" />
            Midiendo...
          </span>
        )}

      </div>

      {/* ==========================
          CONTENIDO: NÚMERO GRANDE + MÉTRICAS + BOTÓN
      ========================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        {/* NÚMERO PRINCIPAL */}

        <div className="text-center sm:text-left shrink-0">
          <p className="text-4xl font-bold text-cyan-400 tabular-nums">
            {descarga} <span className="text-lg text-slate-400">Mbps</span>
          </p>
        </div>

        {/* MÉTRICAS */}

        <div className="grid grid-cols-3 gap-4 flex-1">

          <div className="text-center">
            <Download
              size={16}
              className={`mx-auto mb-1 ${
                fase === "download" ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <p className="text-xs text-slate-400">Descargar</p>
            <p className="text-sm font-semibold text-white">
              {estado === "idle" ? "--" : descarga} Mbps
            </p>
          </div>

          <div className="text-center">
            <Upload
              size={16}
              className={`mx-auto mb-1 ${
                fase === "upload" ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <p className="text-xs text-slate-400">Subir</p>
            <p className="text-sm font-semibold text-white">
              {estado === "idle" || (midiendo && fase === "download") ? "--" : subida} Mbps
            </p>
          </div>

          <div className="text-center">
            <Timer
              size={16}
              className={`mx-auto mb-1 ${
                fase === "ping" ? "text-cyan-400" : "text-slate-500"
              }`}
            />
            <p className="text-xs text-slate-400">Ping</p>
            <p className="text-sm font-semibold text-white">
              {estado === "done" ? `${ping} ms` : "--"}
            </p>
          </div>

        </div>

        {/* BOTÓN */}

        <div className="shrink-0 flex justify-center">

          <button
            type="button"
            onClick={iniciarPrueba}
            disabled={midiendo}
            className="
              flex
              items-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition
              px-5
              py-3
              rounded-xl
              font-semibold
              text-white
              text-sm
              whitespace-nowrap
            "
          >
            {estado === "done" ? (
              <>
                <RefreshCw size={16} />
                Repetir prueba
              </>
            ) : (
              <>
                <Rocket size={16} />
                {midiendo ? "Midiendo..." : "Iniciar prueba"}
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};

export default SpeedTest;
