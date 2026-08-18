# Hierro Gratis

App web de rutina de ejercicio + calorías/macros personalizadas. Gratuita, sin cuenta, instalable como app en el celular (PWA).

## Probarla en tu computadora

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

> Nota: el modo offline (service worker) solo se activa en producción (`npm run build` + `npm run preview`), no en `npm run dev`.

## Publicarla gratis (para que sea instalable de verdad)

La forma más simple es con **Vercel**, gratis para proyectos personales.

### Opción A — Sin usar terminal (recomendada)
1. Crea una cuenta gratis en [vercel.com](https://vercel.com) (puedes entrar con GitHub).
2. Sube esta carpeta a un repositorio nuevo en GitHub (puedes arrastrar los archivos desde la web de GitHub, sin usar comandos).
3. En Vercel, click en "Add New Project", elige ese repositorio, y dale a "Deploy". Vercel detecta que es un proyecto Vite automáticamente.
4. En un par de minutos te da una URL como `https://hierro-gratis.vercel.app`.

### Opción B — Con terminal
```bash
npm install -g vercel
vercel
```
Sigue las instrucciones en pantalla (te pedirá iniciar sesión la primera vez).

## Instalarla en tu celular

Una vez que tengas la URL pública (paso anterior):

**Android (Chrome):** abre la URL → menú (⋮) → "Agregar a pantalla de inicio" o "Instalar app".

**iPhone (Safari):** abre la URL → botón compartir (□↑) → "Agregar a pantalla de inicio".

Después de instalarla, se abre en pantalla completa como cualquier otra app, con su propio ícono, y funciona sin internet una vez que la abriste al menos una vez (gracias al service worker en `public/sw.js`).

## Estructura del proyecto

- `src/App.jsx` — toda la app (cuestionario, cálculo de calorías/macros, generador de rutinas, ideas de comidas, seguimiento de progreso).
- `public/manifest.json` — nombre, ícono y colores que usa el sistema operativo al instalar la app.
- `public/sw.js` — service worker, guarda la app en caché para que funcione sin conexión.
- `public/icons/` — íconos de la app (192px, 512px y versión "maskable" para Android).

## Datos del usuario

Todo se guarda con `localStorage`, es decir, **dentro del propio celular o navegador de cada persona** — no hay base de datos ni servidor, por eso la app puede ser gratis. Si algún día quieres que el progreso se sincronice entre dispositivos, eso ya requeriría un backend con cuentas de usuario.
