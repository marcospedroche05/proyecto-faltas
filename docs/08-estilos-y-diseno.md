# 08 - Estilos y diseno

## Framework CSS

- **Tailwind CSS** como framework principal.
- Los componentes `.scss` estan vacios o con ajustes menores — todo el diseno vive en las clases de Tailwind directamente en los templates HTML.

## Paleta de colores

| Uso | Color | Clase Tailwind |
|---|---|---|
| Fondo principal | Slate 950 | `bg-slate-950` |
| Tarjetas/paneles | Slate 900 con opacidad | `bg-slate-900/75`, `bg-slate-900/80` |
| Texto principal | White | `text-white` |
| Texto secundario | Slate 300-400 | `text-slate-300`, `text-slate-400` |
| Acento primario | Cyan 300 | `text-cyan-300/80` |
| Positivo (justificada, presente) | Emerald | `text-emerald-200`, `bg-emerald-400/10` |
| Negativo (no justificada, falta) | Rose | `text-rose-200`, `bg-rose-400/10` |
| Advertencia (retraso) | Amber | `text-amber-200`, `bg-amber-400/10` |
| Informativo (salida) | Cyan | `text-cyan-200`, `bg-cyan-400/10` |

## Patrones de UI

- **Tarjetas redondeadas**: `rounded-[2rem]` con `border border-white/10` y `backdrop-blur-xl`.
- **Badges de estado**: `rounded-full border px-3 py-1 text-xs font-medium` con color segun estado.
- **Botones primarios**: gradiente `from-cyan-300 to-emerald-300` con `text-slate-950`.
- **Botones de accion**: borde sutil con fondo semitransparente del color correspondiente.
- **Tablas**: `divide-y divide-white/10` con header `bg-white/5`.
- **Scrollables**: `max-h-[60vh] overflow-y-auto` en listas largas.
- **Fondo decorativo**: circulos difuminados con `blur-3xl` en posiciones fijas.

## Responsive

- Grid responsive con `xl:grid-cols-[...]` para layouts asimetricos.
- Mobile-first: stacks verticales por defecto, side-by-side en `lg`/`xl`.
- Header con `lg:flex-row` para colapsar en mobile.
