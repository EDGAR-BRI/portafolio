# Edgar Bri · Portfolio

Portafolio personal construido con **Astro + Vue 3 + Tailwind CSS v4**, con SSR y desplegado en **Vercel**.

## Stack

- [Astro 7](https://astro.build/) — SSR (`output: 'server'`)
- [Vue 3](https://vuejs.org/) — componentes interactivos (LangToggle, Typewriter, LiveRepos, etc.)
- [Tailwind CSS v4](https://tailwindcss.com/) — diseño dark tech con `@tailwindcss/vite`
- [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) — adapter SSR

## Características

- Hero animado con efecto typewriter
- Toggle de idioma **ES / EN** reactivo, persistente en `localStorage`
- **Live GitHub** — fetch dinámico a la API de GitHub filtrado a mis repos destacados
- Proyectos cargados desde **Content Collections** (Markdown con schema)
- Tema oscuro tipo terminal con acentos neón
- Reveal animations con CSS

## Comandos

```bash
pnpm install     # instalar deps
pnpm dev         # dev server (background)
pnpm build       # build producción
pnpm preview     # preview SSR
```

## Deploy (Vercel)

1. Push a GitHub
2. Importar el repo en [vercel.com/new](https://vercel.com/new)
3. Vercel detecta Astro automáticamente y usa el adapter `@astrojs/vercel`

## Estructura

```
src/
├── components/   # Vue islands + Astro components
├── content/proyectos/  # markdown bilingüe de cada proyecto
├── data/site.ts  # traducciones, skills, social
├── layouts/Base.astro
├── pages/index.astro
├── stores/lang.ts  # store global de idioma
└── styles/global.css
```

## Idioma

La preferencia se guarda en `localStorage` bajo la clave `portfolio.lang`.
Se detecta automáticamente del navegador en la primera visita.