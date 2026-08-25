# 🌐 WiFiConnect ISP

Sistema de gestión para proveedores de Internet (ISP), desarrollado con React, Node.js, Express y SQL Server.

Permite administrar clientes, usuarios, planes de Internet, zonas de cobertura y el proceso de autenticación mediante JWT.

---

# 🚀 Tecnologías utilizadas

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend

- Node.js
- Express.js
- JWT (JSON Web Token)
- Nodemailer
- SQL Server (mssql)

## Base de datos

- Microsoft SQL Server

---

# 📂 Estructura del proyecto

```
WiFiConnect/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Instalación

## Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/WifiConnect.git
```

---

## Backend

Entrar al proyecto

```bash
cd backend
```

Instalar dependencias

```bash
npm install
```

Ejecutar

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
```

Instalar dependencias

```bash
npm install
```

Ejecutar

```bash
npm run dev
```

---

# 🔐 Variables de entorno

Crear un archivo

```
.env
```

Ejemplo

```env
PORT=4000

DB_HOST=LUISVILLA\MSSQLSERVER01
DB_NAME=wifi_connect
DB_TRUSTED_CONNECTION=true

JWT_SECRET=tu_clave_super_secreta
JWT_EXPIRES_IN=2h

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=correo@gmail.com
MAIL_PASS=contraseña
```

---

# ✨ Funcionalidades

## Autenticación

- Login
- JWT
- Roles
- Protección de rutas

---

## Administración

- Gestión de usuarios
- Gestión de clientes
- Gestión de planes
- Gestión de zonas

---

## Clientes

Permite

- Registrar clientes
- Editar clientes
- Suspender clientes
- Asignar plan
- Asignar zona
- Cambiar dirección
- Cambiar estado

---

## Planes

- Crear
- Editar
- Eliminar
- Consultar

---

## Zonas

- Crear
- Editar
- Eliminar
- Consultar

---

# 🗄 Base de datos

El sistema utiliza Microsoft SQL Server.

Tablas principales

- usuarios
- clientes
- planes
- zonas
- roles
- facturas
- pagos
- tickets

---

# 🔒 Seguridad

El sistema utiliza

- JWT
- Middleware de autenticación
- Middleware por roles
- Rutas protegidas

---

# 📈 Estado del proyecto

## Finalizado

- Login
- Dashboard
- Usuarios
- Clientes
- Planes
- Zonas
- CRUD completo
- SQL Server
- JWT

## En desarrollo

- Facturación
- Pagos
- Reportes
- Tickets
- Dashboard avanzado
- Protected Routes
- Notificaciones por correo

---

# 🚀 Despliegue

Backend en Render y frontend en Vercel, con la base de datos en Azure SQL.
Guía paso a paso, variables de entorno necesarias y checklist en
[`docs/DEPLOY.md`](docs/DEPLOY.md).

---

# 🛠 Scripts

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

# 👨‍💻 Autor

**Luis Villa**

Estudiante de Análisis y Desarrollo de Software

---

# 📄 Licencia

Proyecto desarrollado con fines académicos y de aprendizaje.
