# GUÍA DE DESPLIEGUE - SISTEMA DE COTIZACIÓN DE VIAJES

## 🚀 PASO A PASO PARA REPLICAR EN TU MÁQUINA

### PASO 1: Descomprimir y entrar al proyecto
```bash
# Descomprimir el archivo
tar -xzf travel-quote-system.tar.gz

# Entrar a la carpeta
cd travel-quote-system
```

### PASO 2: Instalar dependencias
```bash
npm install
```

### PASO 3: Probar localmente (RECOMENDADO)
```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en:
- **Usuario**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Login**: Usuario `admin` / Contraseña `admin123`

**¡Verifica que todo funcione antes de desplegar!**

---

## 📤 OPCIÓN 1: DESPLEGAR EN VERCEL CON GITHUB (Recomendado)

### PASO 4A: Subir a GitHub

```bash
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Sistema de cotización de viajes"

# Crear rama main
git branch -M main
```

**Ahora crea un repositorio en GitHub:**
1. Ve a https://github.com/new
2. Nombre: `travel-quote-system` (o el que prefieras)
3. NO marques "Initialize with README"
4. Click "Create repository"

```bash
# Conectar con GitHub (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir código
git push -u origin main
```

### PASO 5A: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Selecciona tu repositorio `travel-quote-system`
4. **IMPORTANTE**: Antes de hacer deploy, configura las variables de entorno:

#### Variables de Entorno en Vercel:

Click en "Environment Variables" y agrega:

```
NEXTAUTH_URL = https://tu-proyecto.vercel.app
NEXTAUTH_SECRET = [generar uno nuevo - ver abajo]
ADMIN_USERNAME = admin
ADMIN_PASSWORD_HASH = [generar uno nuevo - ver abajo]
```

#### Generar NEXTAUTH_SECRET:
```bash
# En tu terminal local, ejecuta:
openssl rand -base64 32

# Copia el resultado y úsalo como NEXTAUTH_SECRET
```

#### Generar ADMIN_PASSWORD_HASH:
```bash
# Genera el hash de tu contraseña (reemplaza 'tu-contraseña-segura')
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-contraseña-segura', 10));"

# Copia el resultado y úsalo como ADMIN_PASSWORD_HASH
```

5. Click "Deploy"
6. Espera 2-3 minutos
7. ¡Listo! Tu sitio estará en `https://tu-proyecto.vercel.app`

---

## ⚡ OPCIÓN 2: DESPLEGAR DIRECTO CON VERCEL CLI

### PASO 4B: Instalar Vercel CLI
```bash
npm install -g vercel
```

### PASO 5B: Login en Vercel
```bash
vercel login
```
Sigue las instrucciones para autenticarte.

### PASO 6B: Desplegar
```bash
# Deploy de prueba
vercel

# Durante el proceso te preguntará:
# - Set up and deploy? → Y (Yes)
# - Which scope? → Selecciona tu cuenta
# - Link to existing project? → N (No)
# - Project name? → travel-quote-system (o presiona Enter)
# - Directory? → ./ (presiona Enter)
# - Modify settings? → N (No)
```

### PASO 7B: Configurar Variables de Entorno

```bash
# Agregar NEXTAUTH_URL
vercel env add NEXTAUTH_URL

# Cuando te pregunte el valor, ingresa:
https://tu-proyecto.vercel.app

# Selecciona: Production, Preview, Development (todas)

# Agregar NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET
# Ingresa el secret generado (openssl rand -base64 32)

# Agregar ADMIN_USERNAME
vercel env add ADMIN_USERNAME
# Ingresa: admin (o el usuario que prefieras)

# Agregar ADMIN_PASSWORD_HASH
vercel env add ADMIN_PASSWORD_HASH
# Ingresa el hash generado
```

### PASO 8B: Deploy a Producción
```bash
vercel --prod
```

---

## 🔑 GENERAR CREDENCIALES SEGURAS

### Generar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Generar Password Hash
```bash
# Instala bcryptjs si no lo tienes
npm install

# Genera hash (reemplaza 'MiContraseñaSegura123')
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('MiContraseñaSegura123', 10));"
```

---

## ✅ VERIFICAR DESPLIEGUE

Después del despliegue:

1. **Página Usuario**: `https://tu-proyecto.vercel.app`
   - Verifica que el formulario se vea bien
   - Prueba seleccionar fechas y ver el cálculo
   - Prueba agregar actividades

2. **Panel Admin**: `https://tu-proyecto.vercel.app/admin`
   - Debe redirigir a login
   - Ingresa con tus credenciales
   - Descarga la plantilla Excel
   - Sube datos de prueba
   - Verifica que se guardan

3. **Responsive**: 
   - Prueba en móvil
   - Prueba en tablet
   - Todo debe verse bien

---

## 🔄 ACTUALIZAR DESPUÉS DE CAMBIOS

Si haces cambios locales y quieres actualizarlos:

### Con GitHub + Vercel:
```bash
git add .
git commit -m "Descripción de cambios"
git push
```
Vercel desplegará automáticamente.

### Con Vercel CLI:
```bash
vercel --prod
```

---

## 🛠️ COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
vercel logs

# Ver información del proyecto
vercel inspect

# Listar proyectos
vercel ls

# Eliminar proyecto
vercel remove travel-quote-system

# Ver variables de entorno
vercel env ls
```

---

## ⚠️ PROBLEMAS COMUNES

### Error: "Invalid credentials"
- Verifica que ADMIN_PASSWORD_HASH esté bien configurado
- Asegúrate de usar el hash, no la contraseña en texto plano

### Error: "NEXTAUTH_URL not configured"
- Agrega la variable en Vercel Dashboard
- Debe ser la URL completa: `https://tu-proyecto.vercel.app`

### Los cambios no se reflejan
- Haz rebuild: `vercel --prod`
- Limpia caché del navegador

### No puedo hacer login
- Verifica las variables de entorno en Vercel
- Usuario por defecto: `admin`
- Contraseña por defecto: `admin123`

### Los datos no se guardan
- IMPORTANTE: En Vercel los datos se guardan en memoria
- Se reinician con cada deploy
- Para producción seria, usa una base de datos

---

## 📦 RESUMEN DE COMANDOS

### Desarrollo Local:
```bash
cd travel-quote-system
npm install
npm run dev
# Abre http://localhost:3000
```

### Despliegue GitHub + Vercel:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
# Luego conecta en vercel.com
```

### Despliegue Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel
# Configurar variables de entorno
vercel --prod
```

---

## 🎯 URLs IMPORTANTES

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com
- **Documentación NextAuth**: https://next-auth.js.org
- **Documentación Vercel**: https://vercel.com/docs

---

## 💡 TIPS

1. **Usa contraseñas seguras** en producción
2. **Guarda el NEXTAUTH_SECRET** en un lugar seguro
3. **No compartas el hash de contraseña** públicamente
4. **Haz backups** de tu archivo Excel con los datos
5. **Prueba siempre localmente** antes de desplegar

---

## 📞 CONTACTO

Si tienes problemas, revisa:
1. La documentación en README.md
2. Los logs en Vercel Dashboard
3. La consola del navegador (F12)

¡Éxito con tu despliegue! 🚀

