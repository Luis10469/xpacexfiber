# Auditoría de seguridad — WiFiConnect ISP (SpaceX Fiber)

**Fecha:** 24 de agosto de 2026
**Realizado por:** Claude Code, a pedido de Alejandro García
**Commit aplicado:** `2316a78` — *fix: corregir IDOR en clientes y sacar .env del control de versiones*
**Repositorio:** `github.com/Luis10469/xpacexfiber` (público)

---

## 1. Contexto

Se realizó una auditoría de seguridad del backend de WiFiConnect (Node.js + Express + SQL Server), enfocada en autenticación, autorización y manejo de secretos. Se encontraron dos problemas concretos y explotables, detallados abajo junto con el fix aplicado a cada uno.

---

## 2. Hallazgo #1 — Secretos reales expuestos en historial público de git

### Descripción
El archivo `backend/.env` estaba trackeado por git desde el primer commit del proyecto (`442a092`). Como el repositorio remoto es **público**, cualquier persona podía leer su contenido, incluyendo:

- `JWT_SECRET=clave_super_secreta_wifi_connect_2026`
- `MAIL_PASS=vnwuewysfkgfefop` (contraseña de aplicación de Gmail de `holaxrp@gmail.com`)

### Impacto
El middleware `backend/src/middleware/auth.js` valida los tokens únicamente verificando la firma contra `JWT_SECRET`, sin comprobar el token contra ninguna lista de revocación ni volver a consultar el estado del usuario en la base de datos. Con el `JWT_SECRET` expuesto, cualquiera podía **forjar un JWT válido con `rol: "admin"`**, sin necesidad de credenciales, y obtener acceso total a todos los endpoints protegidos (gestión de clientes, usuarios, tickets, dashboard, etc.).

La contraseña de aplicación de Gmail expuesta permite además enviar correo en nombre de `holaxrp@gmail.com` (remitente usado por el sistema de recuperación de contraseña y bienvenida).

### Acción aplicada
- Se agregó `.env`, `backend/.env` y `frontend/.env` al `.gitignore` (antes solo tenía `node_modules`).
- Se removió `backend/.env` del control de versiones con `git rm --cached` (el archivo **sigue existiendo en disco**, solo dejó de estar trackeado por git).
- Se rotó el `JWT_SECRET` localmente por uno nuevo, generado aleatoriamente (384 bits, `crypto.randomBytes(48)`). Todas las sesiones activas quedarán invalidadas la próxima vez que se reinicie el backend con el nuevo valor.

### Actualización — 24-ago-2026
`MAIL_PASS` fue rotado por el equipo: se generó una nueva contraseña de aplicación de Gmail y se actualizó en `backend/.env` local. La contraseña anterior (`vnwuewysfkgfefop`) queda inválida en Google, aunque sigue visible en el historial público de git (ver punto pendiente de limpieza de historial más abajo).

### Pendiente — requiere acción manual del equipo
1. **Reiniciar el backend** para que tome el nuevo `JWT_SECRET` (obliga a todos los usuarios a volver a loguearse) y el nuevo `MAIL_PASS`.
2. **Limpiar el historial de git**: sacar el archivo del tracking no borra los secretos viejos del historial ya publicado. Aunque ambos (`JWT_SECRET` y `MAIL_PASS` anteriores) ya están invalidados, se recomienda eliminarlos igualmente del historial reescribiéndolo con `git filter-repo` o BFG Repo-Cleaner y haciendo `push --force`. Esta es una operación destructiva sobre un repo compartido y no se ejecutó — requiere autorización explícita antes de hacerla.

---

## 3. Hallazgo #2 — IDOR (Insecure Direct Object Reference) en `GET /api/clientes/:id`

### Descripción
En `backend/src/routes/clientes.routes.js`, la ruta `GET /api/clientes/:id` solo pasaba por el middleware `verifyToken`, sin `checkRole` ni ninguna verificación de que el registro consultado perteneciera al usuario autenticado. Esto contrastaba con la ruta hermana `GET /api/clientes/mi-servicio`, que sí filtra correctamente por `req.user.id`.

### Impacto
Cualquier usuario autenticado con rol `cliente` podía iterar manualmente los IDs (`/api/clientes/1`, `/api/clientes/2`, …) y obtener nombre, correo, teléfono, dirección, código de contrato, plan y zona de **cualquier otro cliente** del sistema — una fuga de PII de todos los clientes registrados.

### Acción aplicada
Se modificó `getClienteById` en `backend/src/controllers/clientes.controller.js` para que, cuando `req.user.rol === "cliente"`, la consulta SQL agregue `AND c.usuario_id = @param1` con el `id` del usuario autenticado. Los roles `admin`/`tecnico` mantienen acceso sin restricción, igual que antes.

```js
const filtroPropietario =
  req.user.rol === "cliente"
    ? " AND c.usuario_id = @param1"
    : "";
```

---

## 4. Resumen de archivos modificados (commit `2316a78`)

| Archivo | Cambio |
|---|---|
| `.gitignore` | Se agregan `.env`, `backend/.env`, `frontend/.env` |
| `backend/.env` | Removido del tracking de git (sigue existiendo localmente) |
| `backend/src/controllers/clientes.controller.js` | Fix de IDOR en `getClienteById` |

El commit **no fue pusheado** a `origin/main` — queda pendiente de decisión del equipo.

---

## 5. Recomendaciones para revisiones futuras

- Revisar de forma sistemática que toda ruta que reciba un `:id` de un recurso perteneciente a un cliente (no solo `clientes`, también `tickets`, futuros módulos de facturación/pagos) valide propiedad cuando el rol es `cliente`, siguiendo el patrón ya usado en `tickets.service.js` (`filtroVisibilidad`).
- Nunca commitear archivos `.env` con credenciales reales; usar `.env.example` con valores placeholder para documentar las variables requeridas.
- Considerar rotar y limpiar del historial cualquier secreto que haya estado expuesto en un repositorio público, aunque ya no esté en uso.
