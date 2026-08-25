const ClienteForm = ({
  formulario,
  setFormulario,
  planes = [],
  zonas = [],
}) => {

  const cambiar = (campo, valor) => {
    setFormulario({
      ...formulario,
      [campo]: valor,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">

      {/* Nombre */}
      <div>
        <label className="block mb-2 font-semibold">
          Nombre
        </label>

        <input
          type="text"
          value={formulario.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

      {/* Correo */}
      <div>
        <label className="block mb-2 font-semibold">
          Correo
        </label>

        <input
          type="email"
          value={formulario.correo}
          onChange={(e) => cambiar("correo", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block mb-2 font-semibold">
          Teléfono
        </label>

        <input
          type="text"
          value={formulario.telefono}
          onChange={(e) => cambiar("telefono", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

      {/* Plan */}
      <div>
        <label className="block mb-2 font-semibold">
          Plan
        </label>

        <select
          value={formulario.plan_id}
          onChange={(e) => cambiar("plan_id", Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        >
          <option value="">Seleccione un plan</option>

          {planes.map((plan) => (
            <option
              key={plan.id}
              value={plan.id}
            >
              {plan.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Zona */}
      <div>
        <label className="block mb-2 font-semibold">
          Zona
        </label>

        <select
          value={formulario.zona_id}
          onChange={(e) => cambiar("zona_id", Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        >
          <option value="">Seleccione una zona</option>

          {zonas.map((zona) => (
            <option
              key={zona.id}
              value={zona.id}
            >
              {zona.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div>
        <label className="block mb-2 font-semibold">
          Estado
        </label>

        <select
          value={formulario.estado}
          onChange={(e) => cambiar("estado", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        >
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
        </select>
      </div>

      {/* Dirección */}
      <div className="col-span-2">
        <label className="block mb-2 font-semibold">
          Dirección
        </label>

        <input
          type="text"
          value={formulario.direccion}
          onChange={(e) => cambiar("direccion", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

      {/* Día de facturación */}
      <div>
        <label className="block mb-2 font-semibold">
          Día de facturación
        </label>

        <input
          type="number"
          min="1"
          max="31"
          placeholder="Ej. 1, 15, 24..."
          value={formulario.dia_facturacion}
          onChange={(e) => cambiar("dia_facturacion", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

      {/* Días para vencimiento */}
      <div>
        <label className="block mb-2 font-semibold">
          Días para vencimiento
        </label>

        <input
          type="number"
          min="0"
          placeholder="Ej. 6"
          value={formulario.dias_vencimiento}
          onChange={(e) => cambiar("dias_vencimiento", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>

    </div>
  );
};

export default ClienteForm;