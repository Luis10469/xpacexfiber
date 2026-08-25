# Registro de desarrollo — WiFiConnect / SpaceX Fiber

**Fecha:** 25 de agosto de 2026
**Realizado por:** Claude Code, a pedido de Alejandro García
**Repositorio:** `github.com/Luis10469/xpacexfiber`

Este documento registra los módulos desarrollados con posterioridad a `Documentacion_Desarrollo_Sesion_2026-08-24.md`: la reorganización del módulo de Tickets del Panel Cliente con retención de mensajes, y el desarrollo completo del módulo de Facturación (construcción inicial, enlace/verificación con el Panel Cliente, y la mejora semiautomática). Todo el trabajo descrito acá está sin commitear al momento de escribir este documento; el commit correspondiente se hace inmediatamente después.

---

## 1. Reorganización de Tickets — Panel Cliente

### Contexto
El módulo de Tickets del Panel Cliente necesitaba adaptarse a mobile, y se pidió además una política de retención de 7 días para los mensajes de los tickets ya cerrados, evitando que la base de datos creciera indefinidamente con conversaciones resueltas.

### Hallazgo clave (bug preexistente)
`pages/Cliente/Tickets.jsx` solo renderizaba el layout de escritorio (`TicketLayout`); nunca usaba `TicketLayoutMobile`, aunque ese componente ya existía y ya estaba probado en producción dentro de `Admin/Tickets.jsx`. En mobile, el módulo de tickets del cliente quedaba comprimido e inutilizable.

### Corrección (frontend)
Se replicó en `Cliente/Tickets.jsx` el mismo patrón responsive que ya usa `Admin/Tickets.jsx`: `TicketLayoutMobile` visible con `lg:hidden` y `TicketLayout` (escritorio) con `hidden lg:block`, sin duplicar el componente ni crear una versión paralela.

### Retención de mensajes (7 días)
Por decisión explícita del usuario (confirmada), se activó de una vez un job de limpieza que elimina los mensajes de tickets cerrados con más de 7 días de antigüedad, guardando un resumen antes de borrar.

- `backend/src/services/ticketRetention.service.js` (nuevo): antes de borrar, guarda en la propia tabla `tickets` (`mensajes_total`, `fecha_ultimo_mensaje`) un resumen de los mensajes de cada ticket que tenga al menos un mensaje próximo a purgarse, para no perder trazabilidad; luego elimina de `ticket_mensajes` los mensajes con más de 7 días de antigüedad (`fecha < GETDATE() - 7 días`), en una sola sentencia. El criterio de retención es por **antigüedad del mensaje**, no por el estado del ticket: un ticket abierto con mensajes de hace más de 7 días también los pierde (solo se conserva el resumen, nunca el ticket en sí, que no se borra). Sigue el mismo patrón de capas (`service` sin lógica HTTP) que el resto del backend.
- Se ejecuta al iniciar el servidor (`backend/src/server.js`, vía `programarLimpiezaMensajes()`) y luego se repite automáticamente cada 24 horas mientras el proceso siga vivo, con un único `setInterval` (sin loops anidados ni peticiones repetidas). Esta activación fue confirmada explícitamente por el usuario.

### Verificación
Probado en navegador con sesión de cliente real en un viewport reducido (833px): el layout mobile se muestra correctamente, con el mismo comportamiento ya validado en el panel de administrador. La limpieza de retención se verificó contra mensajes de prueba con fecha antigua, confirmando que se eliminan los mensajes con más de 7 días y que queda guardado el resumen (total y fecha del último mensaje) en el ticket correspondiente antes del borrado.

---

## 2. Módulo de Facturación — construcción inicial

### Contexto
El admin necesitaba crear y publicar facturas asociadas a un cliente real, y que cada cliente pudiera consultar sus propias facturas ("Mis Facturas") sin poder ver ni acceder a las de otro cliente.

### Base de datos
Migración `database/migrations/20260825_add_facturas_numero_periodo_concepto.sql` (aditiva): se agregaron a `facturas` las columnas `numero`, `periodo`, `concepto`, `created_at` y `updated_at`. La tabla `facturas` y sus columnas base (`cliente_id`, `monto`, `fecha_emision`, `fecha_vencimiento`, `estado`) ya existían.

### Backend (nuevo)
`backend/src/services/facturas.service.js` + `controllers/facturas.controller.js` + `routes/facturas.routes.js`, montado en `/api/facturas` (`app.js`):
- `POST /api/facturas` (admin): valida cliente, monto y estado; inserta la factura; genera el número (`FAC-00001`, a partir del `id` real insertado, con `UPDATE ... OUTPUT INSERTED.*`); crea una notificación para el cliente dueño reutilizando la tabla `notificaciones` ya existente (sin `noticia_id`, igual que otras notificaciones puntuales) — **no se creó ningún sistema de notificaciones paralelo**.
- `GET /api/facturas` (admin): listado con filtros de estado/periodo/búsqueda.
- `GET /api/facturas/mias` y `GET /api/facturas/:id`: protegidos con el mismo patrón anti-IDOR usado en `clientes.controller.js` y `tickets.service.js` — un filtro `AND c.usuario_id = @paramN` que se agrega solo si el usuario autenticado no es admin, nunca confiando en un id de cliente enviado desde el cliente.
- `PUT /api/facturas/:id/estado` (admin): actualiza el estado de una factura (`pendiente`/`pagada`/`vencida`/`anulada`).

### Frontend (nuevo)
- `pages/Admin/Facturacion.jsx`: formulario de publicación de factura, con `components/Facturacion/ClientPicker.jsx` para buscar y seleccionar el cliente real por nombre o correo (no existe campo de documento/cédula en el esquema; decisión explícita del usuario de buscar solo por nombre y correo, igual que en Noticias).
- `pages/Cliente/Facturas.jsx`: reescritura completa desde datos simulados hacia datos reales de `GET /facturas/mias`.

### Verificación
Probado con JWT reales (admin y cliente) contra el backend en vivo: creación de factura con generación correcta del número, notificación recibida por el cliente correspondiente, y bloqueo verificado de acceso cruzado (un cliente no puede leer la factura de otro, ni siquiera conociendo su id).

---

## 3. Facturación — enlace y verificación con "Mis Facturas"

### Contexto
Se pidió confirmar explícitamente que el módulo de Facturación del admin y "Mis Facturas" del cliente estuvieran realmente enlazados (mismos datos reales, sin datos ficticios ni un segundo sistema de facturación), y ajustar la vista de "Mis Facturas" a un mockup provisto por el usuario.

### Hallazgo
El enlace ya existía y funcionaba de punta a punta desde la construcción inicial (sección 2): ambos módulos leen y escriben sobre la misma tabla `facturas`, a través de los mismos endpoints (`/facturas` y `/facturas/mias`). Se re-ejecutaron y confirmaron explícitamente las 4 pruebas solicitadas: creación de factura por el admin ligada al `cliente_id` real, aparición inmediata en "Mis Facturas" del cliente correcto, ausencia total en la cuenta de otros clientes, y consistencia de montos/estados entre ambas vistas.

### Frontend (ajuste visual)
`pages/Cliente/Facturas.jsx` se ajustó a un layout dual, replicando el mockup exacto provisto (columnas ID/Periodo/Monto/Emisión/Vencimiento/Estado/Acción):
- Escritorio: tabla (`hidden lg:block`).
- Mobile: tarjetas (`grid sm:grid-cols-2 lg:hidden`).

No se agregó ninguna fila de "Documento", dado que ese campo no existe en el esquema (mismo criterio ya aplicado en Noticias).

### Verificación
Probado en navegador en ambos anchos de pantalla disponibles para prueba; la tabla y las tarjetas muestran exactamente los mismos datos que devuelve la API, sin discrepancias.

---

## 4. Facturación semiautomática (preparación, sin activar generación automática)

### Contexto
Se pidió dejar el módulo de Facturación preparado para una futura facturación mensual automática, **sin activarla todavía**: que al seleccionar un cliente se autocompleten plan, precio, periodo y vencimiento sugeridos (el admin revisa y puede modificarlos antes de publicar), y que no se puedan crear dos facturas del mismo cliente en el mismo periodo sin confirmación explícita.

### Base de datos
Migración `database/migrations/20260825_add_facturacion_config.sql` (aditiva):
- `clientes.dia_facturacion` (`INT NULL`, `CHECK` entre 1 y 31).
- `clientes.dias_vencimiento` (`INT NULL`) — días entre emisión y vencimiento sugeridos para ese cliente; si es `NULL`, el sistema usa un valor por defecto de 6 días.
- `facturas.plan_id` (`INT NULL`, `FK` a `planes.id`) — referencia histórica de qué plan se facturó; el monto real de la factura sigue siendo el que ya se guardaba en `monto`, sin afectar facturas existentes.

Verificado en vivo tras aplicar la migración: mismas 4 filas en `clientes` y 4 en `facturas` que antes, sin pérdida de datos.

### Backend (aditivo, sin endpoints nuevos)
- `clientes.controller.js` (`getClientes`): se agregaron `p.precio AS precio_plan`, `c.dia_facturacion` y `c.dias_vencimiento` al mismo `SELECT` que ya usaba `ClientPicker.jsx` — evita crear un endpoint nuevo solo para exponer estos tres campos. `updateCliente` ahora también guarda `dia_facturacion`/`dias_vencimiento`.
- `facturas.service.js` (`crearFactura`): antes de insertar, valida si ya existe una factura del mismo `cliente_id` y `periodo`; si existe y el admin no confirmó explícitamente (`forzar: true`), responde `409` con el número de la factura existente en el mensaje, en vez de crear un duplicado silencioso.

### Frontend
- `components/Clientes/ClienteForm.jsx`: dos campos nuevos, "Día de facturación" y "Días para vencimiento", en el mismo estilo visual del resto del formulario.
- `pages/Admin/Clientes.jsx`: los dos campos nuevos se agregaron a los cuatro puntos donde se arma el estado del formulario (inicial, alta, edición y reinicio tras guardar), para que no se pierdan al enviar.
- `pages/Admin/Facturacion.jsx`: al seleccionar un cliente, se autocompletan plan, monto (precio del plan), concepto, periodo sugerido (mes/año actual en español) y fecha de vencimiento sugerida (`fecha_emision` + días de vencimiento configurados para ese cliente, o 6 por defecto) — todos estos campos quedan editables, el admin puede modificarlos antes de publicar. Al cambiar de cliente, los valores se recalculan desde cero, sin mezclarse con los del cliente anterior. Si el backend responde `409` por factura duplicada, se reutiliza el `ConfirmModal.jsx` genérico ya existente para preguntar si se quiere publicar de todas formas (`forzar: true`).

### Explícitamente no activado en esta etapa
No se creó ningún cron, tarea programada ni endpoint que genere facturas automáticamente sin que el admin las publique. La automatización mensual real queda para una etapa futura; lo construido acá es la base de datos y la lógica de sugerencia/validación que esa automatización reutilizará.

### Verificación
Probado con curl usando JWT reales: autocompletado de datos por cliente, bloqueo `409` de factura duplicada, y creación exitosa al reenviar con `forzar: true`. Probado en navegador: autocompletado correcto al seleccionar cliente, limpieza total de datos al cambiar de cliente, y el modal de confirmación de duplicado apareciendo y funcionando como se esperaba.

---

## 5. Resumen de archivos

**Nuevos (backend):**
`backend/src/services/{facturas,ticketRetention}.service.js`, `backend/src/controllers/facturas.controller.js`, `backend/src/routes/facturas.routes.js`, `database/migrations/20260825_add_facturas_numero_periodo_concepto.sql`, `database/migrations/20260825_add_facturacion_config.sql`

**Nuevos (frontend):**
`frontend/src/components/Facturacion/ClientPicker.jsx`, `frontend/src/pages/Admin/Facturacion.jsx`

**Modificados:**
`backend/src/app.js` (registro del router de facturas), `backend/src/server.js` (ejecución del barrido de retención al arrancar), `backend/src/controllers/clientes.controller.js` (campos de facturación en `getClientes`/`updateCliente`), `frontend/src/App.jsx` y `frontend/src/components/Sidebar/Sidebar.jsx` (ruta y enlace de Facturación), `frontend/src/components/Clientes/ClienteForm.jsx`, `frontend/src/pages/Admin/Clientes.jsx`, `frontend/src/pages/Cliente/{Tickets,Facturas}.jsx`

Ningún módulo no relacionado fue modificado. No se creó ningún endpoint, tabla ni sistema de notificaciones duplicado.
