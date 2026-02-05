# Sistema de Cotización de Viajes

Sistema completo de cotización de viajes con panel de administración protegido para gestionar precios.

## 🎯 Características

### Frontend Usuario
- ✅ Formulario de cotización con cálculo automático de precios
- ✅ Diseño totalmente responsivo (mobile, tablet, desktop)
- ✅ Sistema de selección de actividades con búsqueda
- ✅ Múltiples actividades seleccionables
- ✅ Cálculo dinámico de precio total

### Frontend Admin
- 🔒 Autenticación con NextAuth.js
- 📤 Subida de archivos Excel para actualizar datos masivamente
- ✏️ Edición manual de todos los campos
- ➕ Agregar/eliminar destinos, orígenes, tipos de vuelo y actividades
- 💾 Guardado persistente de datos

## 📁 Estructura del Proyecto

```
travel-quote-system/
├── app/
│   ├── page.tsx              # Página principal (usuario) - Responsivo
│   ├── admin/
│   │   ├── page.tsx          # Panel admin con auth
│   │   └── login/
│   │       └── page.tsx      # Página de login
│   ├── api/
│   │   ├── pricing/
│   │   │   └── route.ts      # API GET/POST precios
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth config
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx         # SessionProvider
├── data/
│   └── pricing.json          # Datos (se genera automáticamente)
├── .env.local                # Variables de entorno (local)
├── .env.example              # Ejemplo de variables
├── package.json
└── README.md
```

## 🚀 Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (Opcional)
El proyecto ya viene con `.env.local` preconfigurado. Si quieres cambiar las credenciales:

```bash
# Edita .env.local con tus valores
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=tu-hash-bcrypt
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

Accede a:
- **Usuario**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Credenciales por defecto**: 
  - Usuario: `admin`
  - Contraseña: `admin123`

## 📦 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

#### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

#### 2. Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Importa tu repositorio
4. **Configurar Variables de Entorno en Vercel:**
   - `NEXTAUTH_URL` = `https://tu-proyecto.vercel.app`
   - `NEXTAUTH_SECRET` = (genera uno: `openssl rand -base64 32`)
   - `ADMIN_USERNAME` = `admin` (o el que prefieras)
   - `ADMIN_PASSWORD_HASH` = (hash bcrypt de tu contraseña)
5. Click "Deploy"

#### 3. Generar Password Hash para Producción
```bash
# Instala bcryptjs si no lo tienes
npm install -g bcryptjs

# Genera el hash (reemplaza 'tu-contraseña-segura')
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-contraseña-segura', 10));"
```

### Opción 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel

# Configurar variables de entorno durante el deploy
# O después en el dashboard de Vercel
```

## 🔑 Autenticación

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Cambiar Contraseña

#### Para desarrollo local:
Edita `.env.local`:
```bash
ADMIN_USERNAME=nuevo_usuario
ADMIN_PASSWORD_HASH=nuevo_hash
```

#### Para producción (Vercel):
1. Genera un nuevo hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('nueva-contraseña', 10));"
```

2. En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:
   - Actualiza `ADMIN_USERNAME`
   - Actualiza `ADMIN_PASSWORD_HASH`

3. Redeploy el proyecto

## 📊 Gestión de Datos

### Subir Excel

1. Accede a `/admin`
2. Click en "Descargar Plantilla Excel"
3. Edita los datos en el Excel con las siguientes hojas:

#### Estructura del Excel

**1. Destinos**
| Destino | PrecioBase |
|---------|------------|
| Guatemala | 500 |
| México | 800 |

**2. Origenes**
| Origen |
|--------|
| Guatemala |
| México |

**3. TiposVuelo**
| Tipo | Multiplicador |
|------|---------------|
| Económico | 1.0 |
| Ejecutivo | 1.5 |

**4. Hoteles**
| Estrellas | PrecioPorNoche |
|-----------|----------------|
| 3 | 50 |
| 4 | 100 |

**5. Restaurantes**
| Estrellas | PrecioPorDia |
|-----------|--------------|
| 3 | 30 |
| 4 | 60 |

**6. Transporte**
| Estrellas | PrecioPorDia |
|-----------|--------------|
| 3 | 40 |
| 4 | 80 |

**7. Actividades**
| Nombre | Precio |
|--------|--------|
| City Tour | 50 |
| Museo | 30 |

4. Sube el Excel en el panel admin
5. Click "Guardar Cambios"

### Edición Manual

En el panel admin también puedes:
- ➕ Agregar nuevos destinos, orígenes, tipos de vuelo
- ✏️ Modificar precios directamente
- 🗑️ Eliminar elementos
- ➕ Agregar/editar actividades ilimitadas

## 🧮 Fórmula de Cálculo

```
Precio Total = Vuelo + Hotel + Restaurantes + Transporte + Actividades

Donde:
- Vuelo = Precio Base Destino × Multiplicador Vuelo × Total Personas
- Hotel = Precio Por Noche × Noches × Habitaciones
- Restaurantes = Precio Por Día × Noches × Total Personas
- Transporte = Precio Por Día × Noches
- Actividades = Suma de precios de actividades seleccionadas
```

## 📱 Responsive Design

El sistema está optimizado para:
- 📱 Móviles (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktop (1024px+)

## 🛠️ Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **NextAuth.js** - Autenticación
- **XLSX** - Procesamiento Excel
- **bcryptjs** - Hash de contraseñas
- **Vercel** - Hosting

## ⚠️ Importante para Producción

1. **Cambiar NEXTAUTH_SECRET**: Genera uno seguro
   ```bash
   openssl rand -base64 32
   ```

2. **Cambiar credenciales admin**: Usa contraseñas fuertes

3. **HTTPS obligatorio**: NextAuth requiere HTTPS en producción (Vercel lo proporciona)

4. **Persistencia de datos**: 
   - En desarrollo: Los datos se guardan en `/data/pricing.json`
   - En Vercel: Los datos se guardan en memoria (se reinician con cada deploy)
   - Para producción seria, considera usar una base de datos

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Generar hash de contraseña
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-contraseña', 10));"
```

## 📞 Soporte

- Email: info@travelquote.com
- Tel: +502 1234-5678

## 📝 Notas

- Los datos en Vercel se reinician con cada deploy (usa base de datos para persistencia)
- El sistema permite actividades ilimitadas
- Búsqueda de actividades en tiempo real
- Diseño completamente responsivo

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Contraseñas hasheadas con bcrypt
- CSRF protection incluida
- Variables de entorno para secretos

