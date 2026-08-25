# 🚀 Despliegue — Backend en Render / Frontend en Vercel

Este documento explica cómo publicar WiFiConnect (SpaceX Fiber) usando:

- **Render** para el backend (Node.js + Express)
- **Vercel** para el frontend (React + Vite)
- **Azure SQL Database** como base de datos (ya migrada)

---

## 0. Antes de empezar

- El repositorio ya tiene `backend/.env` y `frontend/.env` ignorados por Git
  (`.gitignore`). **Ningún secreto se sube al repo** — todas las variables de
  entorno se configuran directamente en los paneles de Render y Vercel.
- La base de datos ya corre en Azure SQL (`spacexfiber-sql.database.windows.net`,
  región Central US), así que no requiere migración adicional.

---

## 1. Backend en Render

1. En Render → **New → Web Service** → conectar el repositorio de GitHub.
2. Configuración del servicio:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node
3. Variables de entorno (Settings → Environment), con los mismos nombres que
   `backend/.env` pero usando el modo nube:

   | Variable | Valor |
   |---|---|
   | `PORT` | `4000` (Render igual expone su propio puerto público) |
   | `NODE_ENV` | `production` |
   | `DB_TRUSTED_CONNECTION` | `false` |
   | `DB_HOST` | `spacexfiber-sql.database.windows.net` |
   | `DB_NAME` | `spacexfiber-db` |
   | `DB_USER` | usuario SQL de Azure |
   | `DB_PASSWORD` | contraseña SQL de Azure |
   | `JWT_SECRET` | igual que en `.env` local, o uno nuevo para producción |
   | `JWT_EXPIRES_IN` | `2h` |
   | `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM` | credenciales de Nodemailer |
   | `RATE_LIMIT_WINDOW` / `RATE_LIMIT_MAX` | `15` / `100` |

4. **Importante — firewall de Azure SQL**: Render usa IPs dinámicas (no fijas
   salvo plan con IP estática). En Azure SQL → *Networking* → activa
   **"Allow Azure services and resources to access this server"** solo cubre
   servicios de Azure, no Render. Como Render no es un servicio Azure, la
   opción real es:
   - Agregar una regla de firewall con el rango de IPs salientes de Render
     (Render las publica en su dashboard, `Settings → Outbound IPs`), o
   - Usar un plan de Render con IP estática y agregar esa IP puntual al
     firewall de Azure SQL.

   Sin este paso, el backend en Render no podrá conectarse a la base de datos
   (`❌ Error al conectar con SQL Server`).

5. Al desplegar, Render entrega una URL pública tipo
   `https://spacexfiber-backend.onrender.com`. Verifica que responda:
   `GET https://spacexfiber-backend.onrender.com/` → `{"message": "API Spacex-fiber funcionando ✅"}`

---

## 2. Frontend en Vercel

1. En Vercel → **Add New → Project** → importar el mismo repositorio.
2. Configuración:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (autodetectado)
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: `dist` (por defecto)
3. Variable de entorno:

   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | `https://spacexfiber-backend.onrender.com/api` (la URL de Render del paso anterior) |

   El frontend ya está preparado para esto —
   `frontend/src/services/api.js` usa
   `import.meta.env.VITE_API_URL || 'http://localhost:4000/api'`,
   así que en local sigue apuntando a `localhost` sin tocar nada.

4. Deploy. Vercel entrega una URL pública tipo
   `https://spacexfiber.vercel.app`.

### Si el frontend se despliega como Static Site en Render (en vez de Vercel)

Al recargar o entrar directo a una ruta como `/planes` o `/admin/dashboard`,
Render busca ese archivo físico en `dist/` y devuelve `404 Not Found` — es una
SPA con React Router, todas las rutas deben servir `index.html` y dejar que
el router las resuelva en el navegador. Hay que agregar una regla de rewrite:

- Panel del servicio (Static Site) → **Redirects/Rewrites** → agregar:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

Sin esta regla, solo la ruta `/` funciona; cualquier otra ruta accedida
directamente (o recargada con F5) da 404.

---

## 3. CORS

El backend usa `app.use(cors())` sin restricciones (`backend/src/app.js`), por
lo que acepta peticiones desde cualquier origen, incluyendo el dominio de
Vercel, sin configuración adicional. Si más adelante se quiere restringir a
un dominio específico por seguridad, cambiar a:

```js
app.use(cors({ origin: "https://spacexfiber.vercel.app" }));
```

---

## 4. Checklist final

- [ ] Variables de entorno cargadas en Render (backend)
- [ ] Firewall de Azure SQL permite las IPs de Render
- [ ] `GET /` del backend responde en producción
- [ ] `VITE_API_URL` configurada en Vercel apuntando al backend de Render
- [ ] Login funcionando end-to-end contra la URL pública
