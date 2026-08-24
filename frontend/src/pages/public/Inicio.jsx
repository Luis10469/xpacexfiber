import { Link } from 'react-router-dom';
import { useState } from 'react';
import StarField from '../../components/StarField/StarField';

const faqs = [
  {
    pregunta: '¿Cómo contrato el servicio de SpaceX Fiber?',
    respuesta:
      'Primero consulta la cobertura en tu zona. Si existe disponibilidad, puedes revisar nuestros planes y comenzar el proceso de contratación.',
  },
  {
    pregunta: '¿Cuánto tarda la instalación?',
    respuesta:
      'La instalación normalmente se programa entre 24 y 48 horas hábiles después de confirmar el servicio.',
  },
  {
    pregunta: '¿Qué métodos de pago manejan?',
    respuesta:
      'Puedes consultar los métodos de pago disponibles durante el proceso de contratación o comunicarte con nuestro equipo de soporte.',
  },
  {
    pregunta: '¿Puedo cambiar de plan?',
    respuesta:
      'Sí. Puedes solicitar un cambio de plan según la disponibilidad y las condiciones de tu servicio.',
  },
  {
    pregunta: '¿Qué hago si tengo problemas con mi internet?',
    respuesta:
      'Puedes contactar a soporte o crear un ticket desde tu cuenta para que podamos ayudarte con el problema.',
  },
];

const Inicio = () => {
  const [faqAbierta, setFaqAbierta] = useState(null);

  return (
    <div className="relative min-h-screen text-center py-10 text-white">
      
      {/* ======================================
          FONDO ANIMADO - SOLO INICIO
      ====================================== */}
      <StarField />

      {/* ======================================
          CONTENIDO
      ====================================== */}
      <div className="relative z-10">

        {/* HERO */}
        <section className="py-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
            Bienvenido a{' '}
            <span className="text-blue-400">
              SpaceX Fiber
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12">
            Internet de alta velocidad para tu hogar y empresa
          </p>
        </section>

        {/* BENEFICIOS */}
        <section className="grid md:grid-cols-3 gap-6 mt-10">

          {/* VELOCIDAD */}
          <div className="bg-slate-800/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-slate-800/20 transition transform hover:scale-105">
            <div className="text-5xl mb-4">
              🚀
            </div>

            <h3 className="font-bold text-2xl mb-2 text-white">
              Alta Velocidad
            </h3>

            <p className="text-gray-200">
              Planes desde 50MB hasta 1GB
            </p>
          </div>

          {/* COBERTURA */}
          <div className="bg-slate-800/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-slate-800/20 transition transform hover:scale-105">
            <div className="text-5xl mb-4">
              📡
            </div>

            <h3 className="font-bold text-2xl mb-2 text-white">
              Cobertura Total
            </h3>

            <p className="text-gray-200">
              Llegamos a tu barrio o residencia
            </p>
          </div>

          {/* SOPORTE */}
          <div className="bg-slate-800/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-slate-800/20 transition transform hover:scale-105">
            <div className="text-5xl mb-4">
              💬
            </div>

            <h3 className="font-bold text-2xl mb-2 text-white">
              Soporte 24/7
            </h3>

            <p className="text-gray-200">
              Atención personalizada todos los días
            </p>
          </div>

        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto mt-24 px-4 text-left">

          <div className="text-center mb-10">

            <span className="text-blue-400 font-semibold uppercase tracking-widest text-sm">
              Centro de ayuda
            </span>

            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              Preguntas frecuentes
            </h2>

            <p className="text-gray-400 mt-4">
              Haz clic en una pregunta para ver su respuesta.
            </p>

          </div>

          {/* PREGUNTAS */}
          <div className="space-y-4">

            {faqs.map((faq, index) => {
              const abierta = faqAbierta === index;

              return (
                <div
                  key={index}
                  className="bg-slate-800/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setFaqAbierta(
                        abierta ? null : index
                      )
                    }
                    className="w-full flex justify-between items-center gap-4 p-6 text-left hover:bg-slate-800/10 transition"
                  >

                    <span className="font-bold text-lg">
                      {faq.pregunta}
                    </span>

                    <span
                      className={`text-blue-400 text-3xl transition-transform duration-300 ${
                        abierta ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>

                  </button>

                  {abierta && (
                    <div className="px-6 pb-6 text-gray-300 leading-relaxed">

                      <div className="border-t border-white/10 pt-5">
                        {faq.respuesta}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>

          {/* BOTÓN FAQ COMPLETO */}
          <div className="text-center mt-8">

            <Link
              to="/faq"
              className="inline-block text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Ver todas las preguntas →
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
};

export default Inicio;