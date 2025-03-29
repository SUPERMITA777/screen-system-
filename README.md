# Sistema de Petición de Canciones para DJ

Sistema web para que los invitados puedan solicitar canciones, enviar mensajes y fotos que se mostrarán en una pantalla de eventos.

## Requisitos

- Node.js 18.0.0 o superior
- NPM o PNPM
- Una cuenta de Supabase (https://supabase.com)
- Una cuenta de Vercel (https://vercel.com)

## Configuración Local

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install --legacy-peer-deps
# o con pnpm
pnpm install --no-strict-peer-dependencies
```

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Puedes obtener estas credenciales en tu dashboard de Supabase.

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si no tienes una
2. Importa este repositorio en Vercel
3. Configura las siguientes variables de entorno en la configuración del proyecto en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

4. Vercel detectará automáticamente que es un proyecto Next.js y lo configurará correctamente

## Ejecución Local

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
# o con pnpm
pnpm dev
```

El sistema se iniciará en `http://localhost:3000`

## Páginas principales

- `/` - Página de inicio donde los invitados pueden hacer sus solicitudes
- `/dj` - Panel de control del DJ para ver y gestionar solicitudes
- `/pantalla` - Página para mostrar en la pantalla del evento
- `/setup` - Configuración inicial del sistema

## Actualización del Repositorio

Para facilitar la actualización del repositorio, puedes usar el archivo `update-repo.bat`:

1. Haz doble clic en `update-repo.bat`
2. Ingresa el mensaje del commit cuando se te solicite
3. Los cambios se subirán automáticamente a GitHub

## Resolución de problemas

Si encuentras errores relacionados con las dependencias, puedes intentar:

```bash
npm install --legacy-peer-deps --force
```

Existe un conflicto entre `date-fns` v4 y `react-day-picker` que se resuelve usando la bandera `--legacy-peer-deps`.

Si encuentras problemas con la base de datos, el sistema intentará inicializarla automáticamente. Asegúrate de que tus credenciales de Supabase sean correctas.

## Licencia

MIT 