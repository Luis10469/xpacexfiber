# Registro de desarrollo — WiFiConnect / SpaceX Fiber

**Fecha:** 24 de agosto de 2026
**Realizado por:** Claude Code, a pedido de Alejandro García
**Repositorio:** `github.com/Luis10469/xpacexfiber`

Este documento registra los módulos desarrollados en la sesión de hoy, posterior a la auditoría de seguridad (ver `Documentacion_Auditoria_Seguridad_2026-08-24.md`). Todo el trabajo descrito acá está sin commitear al momento de escribir este documento; el commit correspondiente se hace inmediatamente después.

---

## 1. Módulo de Noticias y Notificaciones

### Contexto
El admin necesitaba publicar noticias dirigidas a "todos los usuarios" o a una selección específica, y que cada usuario viera automáticamente al iniciar sesión las noticias nuevas correspondientes, más un centro de notificaciones (campana) para consultarlas después.

### Hallazgo clave
Las tablas `noticias` y `notificaciones` ya existían en SQL Server (48 y 16 filas respectivamente) pero sin ningún endpoint de backend que las usara, y con un frontend no funcional (`Admin/Noticias.jsx` no llamaba a la API; `Cliente/Notificaciones.jsx` era un archivo vacío sin rutear).

### Base de datos
Migración `database/migrations/20260824_create_noticias_notificaciones_destinatarios.sql` (aditiva, no destructiva, verificada idempotente):
- `noticias`: se agregó `destinatario_tipo` (`'todos'` | `'especificos'`) y `emisor_id`.
- `notificaciones`: se agregó `noticia_id` (FK a `noticias`, `ON DELETE CASCADE`) y `leido_at`. Se reutilizó esta tabla existente como la tabla de destinatario+lectura por usuario, en vez de crear una tabla nueva (`notificaciones` ya tenía `usuario_id`, `titulo`, `mensaje`, `leido`, `created_at`).
- Índice único filtrado `(noticia_id, usuario_id) WHERE noticia_id IS NOT NULL` para evitar destinatarios duplicados, sin afectar las 16 filas antiguas.

### Backend (nuevo)
- `backend/src/services/noticias.service.js`, `backend/src/controllers/noticias.controller.js`, `backend/src/routes/noticias.routes.js`, montado en `/api/noticias` (`app.js`).
- Al publicar "todos", se resuelve el destinatario **siempre en el servidor** (nunca se confía en un flag del cliente) contra la tabla `usuarios` activos.
- Al publicar "específicos", se deduplican los IDs recibidos y se valida que existan antes de insertar (error 400 claro si no).
- `PUT /api/noticias/notificaciones/:id/leido` verifica que la notificación pertenezca al usuario autenticado (mismo patrón anti-IDOR aplicado antes en `clientes.controller.js`).

### Frontend (nuevo)
- `hooks/useNotificaciones.js`: estado único con polling cada 60s (sin websockets, no había infraestructura previa).
- `components/Notificaciones/NotificationBell.jsx`: campana flotante con contador de no leídas y dropdown.
- `components/Notificaciones/NuevasNoticiasModal.jsx`: modal automático al iniciar sesión si hay noticias no leídas.
- `components/Noticias/RecipientPicker.jsx`: buscador + checkboxes + contador + seleccionar/deseleccionar todos (no existía ningún patrón de multiselección previo en el proyecto).
- Reescritura completa de `pages/Admin/Noticias.jsx`.
- `AdminLayout.jsx` y `ClienteLayout.jsx`: una línea agregada cada uno para montar la campana y el modal.

### Verificación
Probado en vivo contra el backend real: publicación "todos"/"específicos", deduplicación, validación 400, protección anti-IDOR (404 al intentar marcar como leída una notificación ajena), y las notificaciones antiguas (sin `noticia_id`) siguen apareciendo con su propio título/mensaje.

---

## 2. Dashboard de Reportes y Estadísticas

### Contexto
`Admin/Reportes.jsx` era un placeholder con tarjetas en 0 y el mensaje "Próximamente con Chart.js". Se pidió conectarlo a datos reales de SQL Server, con tarjetas, 5 gráficas y filtros por periodo/zona/plan.

### Hallazgo clave
La tabla `facturas` existe pero tiene **0 filas** (no hay facturación real cargada). Por decisión explícita del usuario, "ingresos del mes" se calcula como `SUM(facturas.monto) WHERE estado='pagada'` — el dato real, aunque hoy sea $0. No se sustituyó por una proyección inventada a partir de precios de planes.

### Backend (nuevo)
`backend/src/services/reportes.service.js` + `controllers/reportes.controller.js` + `routes/reportes.routes.js`, un solo endpoint consolidado `GET /api/reportes?zona_id=&plan_id=&meses=` que devuelve el resumen y los 5 datasets en una sola respuesta.

Reglas de diseño aplicadas para evitar bugs concretos:
- `ISNULL(SUM(...), 0)` en toda agregación de ingresos (SQL Server devuelve `NULL`, no `0`, al sumar cero filas).
- Zero-fill de meses en JavaScript (no en SQL) para que las series de tiempo nunca tengan huecos.
- "Tickets abiertos" = `estado NOT IN ('Resuelto','Cerrado')`.
- "Zonas cubiertas" = zonas activas con al menos un cliente activo.
- "Planes más contratados": `INNER JOIN` + `HAVING COUNT>0` + `TOP 10`, porque la tabla `planes` tiene 83 filas y la mayoría no tiene ningún cliente.
- Los filtros que colapsarían su propio gráfico a una sola barra se excluyen a propósito ("clientes por zona" ignora `zona_id`, "planes más contratados" ignora `plan_id`), mientras siguen respetando el otro filtro.

**Bug encontrado y corregido durante las pruebas:** `plan` es una palabra reservada para el driver ODBC usado (`msnodesqlv8`); un alias SQL `AS plan` rompía la consulta de "planes más contratados" con un error de sintaxis. Se renombró el alias a `nombrePlan`.

### Frontend (nuevo)
Se instalaron `chart.js` y `react-chartjs-2` (no estaban en el proyecto). Nueva carpeta `frontend/src/components/Reportes/` con 5 componentes de gráfica (ingresos mensuales, clientes por zona, tickets por estado, planes más contratados, crecimiento de clientes) y reescritura completa de `pages/Admin/Reportes.jsx` con filtros de periodo/zona/plan.

### Verificación
Probado en el navegador con sesión de admin real: las 4 tarjetas y las 5 gráficas coinciden con los datos devueltos por la API; los filtros de zona/plan cambian los números correctamente sin colapsar los gráficos que no deben colapsar; `GET /api/dashboard` (módulo existente, no tocado) sigue devolviendo exactamente lo mismo.

---

## 3. Bug bloqueante encontrado: dependencia `react-icons` faltante

Al probar `/admin/reportes` en el navegador, se encontró que **toda la aplicación fallaba al cargar en modo desarrollo**: `pages/public/Login.jsx` importa `react-icons/fa` (para el ícono de mostrar/ocultar contraseña), pero esa dependencia nunca se instaló. Como `App.jsx` importa `Login.jsx` de forma directa (no perezosa), esto rompía la carga de cualquier ruta, no solo el login.

**Corrección:** se instaló `react-icons` (único paquete faltante, usado solo en ese archivo) y se reinició el servidor de desarrollo de Vite para que lo pre-empaquetara.

---

## 4. Medidor de velocidad (Speed Test) — Dashboard Cliente

Nuevo componente independiente `frontend/src/components/SpeedTest/SpeedTest.jsx`, integrado en `pages/Cliente/Dashboard.jsx` debajo de las 6 tarjetas existentes (sin modificarlas). Tarjeta compacta y horizontal (no un medidor circular tipo Speedtest a pantalla completa), con simulación animada de descarga/subida/ping anclada de forma realista a la velocidad del plan contratado del cliente cuando el dato es válido.

Verificado en navegador: flujo completo (idle → midiendo → completado → repetir), sin errores de consola, sin overflow, integrado con el mismo estilo visual (`bg-slate-800 rounded-2xl shadow-lg`) que las demás tarjetas del Dashboard Cliente.

---

## 5. Módulo "Mi Servicio" — Panel Cliente

### Hallazgo clave (bug preexistente)
`pages/Cliente/MiServicio.jsx` llamaba a `GET /clientes` — el endpoint **admin-only** (`checkRole('admin')`), sin filtrar por el cliente autenticado. Para un usuario con rol `cliente`, esa llamada devolvía 403: el módulo nunca funcionó realmente para un cliente real.

### Corrección
Reescritura completa del componente reutilizando el endpoint correcto, ya existente y ya usado por el Dashboard: `GET /clientes/mi-servicio`. No se tocó el backend — todos los campos pedidos (estado, plan, velocidad, precio, zona, código de contrato, fecha de instalación) ya los devuelve ese endpoint.

Se agregaron: tarjeta de estado con color/ícono/mensaje dinámico según el valor real (`activo`/`suspendido`/`cancelado`), tarjeta de plan contratado, velocidad contratada (separada de la prueba de velocidad del Dashboard), precio mensual, sección de información de instalación, y una tarjeta resumen al final. Es un módulo de solo lectura: no se agregó ningún formulario ni endpoint de edición.

### Verificación
Probado en navegador con sesión de cliente real: todos los datos correctos, sin errores de consola, todo el contenido cabe casi sin scroll.

---

## 6. Correcciones en el Dashboard Cliente: responsive y estado en tiempo real

### Diagnóstico

**Responsive roto en mobile:** `frontend/src/layouts/ClienteLayout.jsx` tenía `ml-[360px]` en el `<main>` **sin el prefijo `lg:`**, a diferencia de `AdminLayout.jsx` que sí lo tenía. En mobile el Sidebar está oculto fuera de pantalla, pero `main` seguía reservando 360px de margen izquierdo en todos los tamaños de pantalla — en un celular de ~390px de ancho eso dejaba ~30px de ancho útil, produciendo el desplazamiento hacia la derecha y las tarjetas angostas reportadas.

**Estado del servicio no se actualizaba:** la cadena completa (JWT → `verifyToken` → `getMiServicio` → `SELECT c.*, ... WHERE c.usuario_id=@param0`) siempre fue correcta y sin caché en ningún punto — el estado devuelto es siempre el valor real y actual de SQL Server. El problema real era que `pages/Cliente/Dashboard.jsx` solo pedía los datos una vez, al montar el componente (`useEffect` con `[]`); si el cliente dejaba la pestaña abierta y el admin cambiaba su estado en otra sesión, el Dashboard nunca volvía a pedir los datos.

### Corrección
- `ClienteLayout.jsx`: el `<main>` ahora usa exactamente el mismo patrón responsive ya probado en `AdminLayout.jsx` (`lg:ml-[360px]`, `pt-24` de despeje para el botón hamburguesa en mobile, `overflow-x-hidden`).
- `Dashboard.jsx`: se agregó un único listener de `visibilitychange` (se limpia al desmontar, sin intervalos ni polling) que revalida los datos cuando el cliente vuelve a la pestaña — sin loops, sin peticiones repetidas.
- El encabezado "Bienvenido, [nombre]" ahora usa `break-words` y tamaño de fuente responsive para que un nombre largo no rompa el diseño en mobile.

### Verificación
Probado en el navegador (833px de ancho, por debajo de los breakpoints donde ocurría el bug): hamburguesa y campana visibles, contenido a todo el ancho, tarjetas en una sola columna, sin scroll horizontal. Se confirmó contra la base de datos en vivo que el cliente de prueba tenía `estado='suspendido'` y el Dashboard lo mostraba correctamente (no un valor hardcodeado); se cambió el estado a `activo` directamente en SQL Server y, al recargar, el Dashboard reflejó el cambio de inmediato. Se restauró el estado original del cliente de prueba al finalizar.

---

## 7. Resumen de archivos

**Nuevos (backend):**
`backend/src/services/{noticias,reportes}.service.js`, `backend/src/controllers/{noticias,reportes}.controller.js`, `backend/src/routes/{noticias,reportes}.routes.js`, `database/migrations/20260824_create_noticias_notificaciones_destinatarios.sql`

**Nuevos (frontend):**
`frontend/src/hooks/useNotificaciones.js`, `frontend/src/components/Noticias/RecipientPicker.jsx`, `frontend/src/components/Notificaciones/{NotificationBell,NuevasNoticiasModal}.jsx`, `frontend/src/components/Reportes/*` (5 gráficas + `chartSetup.js`), `frontend/src/components/SpeedTest/SpeedTest.jsx`

**Modificados:**
`backend/src/app.js` (registro de los routers nuevos), `frontend/package.json` (agrega `chart.js`, `react-chartjs-2`, `react-icons`), `frontend/src/layouts/{AdminLayout,ClienteLayout}.jsx`, `frontend/src/pages/Admin/{Noticias,Reportes,LoginLogs}.jsx`, `frontend/src/pages/Cliente/{Dashboard,MiServicio}.jsx`

Ningún módulo no relacionado fue modificado. No se creó ningún endpoint ni tabla duplicada.
