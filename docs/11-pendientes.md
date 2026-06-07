# 11 - Tareas pendientes

## Prioridad alta

- [x] **Test de integracion completo**: Flujo completo login → dashboard → operaciones CRUD verificado manualmente contra TajamarFaltasApi en http://localhost:5209. Todos los roles funcionan correctamente.
- [x] **Manejo de errores global**: implementar un interceptor o servicio de notificaciones para mostrar errores HTTP al usuario de forma consistente (toast/snackbar).
- [x] **Loading states**: anadir indicadores de carga (spinners) en los dashboards mientras se obtienen datos de la API.
- [x] **Confirmacion antes de eliminar**: dialogo de confirmacion antes de `deleteFalta()` en profesor y admin.

## Prioridad media

- [ ] **Paginacion en admin**: el endpoint `GET /api/admin/faltas` puede devolver muchos registros. Implementar paginacion en backend y frontend.
- [ ] **Filtros de faltas**: filtrar por rango de fechas, tipo de falta y estado de justificacion en los dashboards de profesor y admin.
- [ ] **Edicion de faltas (profesor)**: permitir al profesor editar el tipo y comentario de una falta existente (`PUT /api/profesor/faltas/{id}`).
- [x] **Notificacion de exito/error**: feedback visual (toast) despues de operaciones como justificar, eliminar, guardar pase de lista.
- [x] **Logout automatico**: detectar token expirado (401) y redirigir al login limpiando sesion.
- [x] **Navegacion por rol en header**: mostrar enlace directo al dashboard del rol actual en la barra de navegacion.

## Prioridad baja

- [x] **Environment de produccion**: crear `environment.prod.ts` con URL de produccion.
- [x] **Tests unitarios**: los tests por defecto de Angular estan rotos tras la refactorizacion (imports de servicios eliminados). Actualizar o eliminar `*.spec.ts`. — El spec roto `app.component.spec.ts` fue eliminado.
- [x] **Lazy loading**: las rutas cargan componentes directamente con `component:`. Convertir a `loadComponent` para code splitting. — Todas las rutas en `app.routes.ts` usan `loadComponent`, bundle inicial bajó de ~380 kB a ~303 kB.
- [ ] **Responsive polish**: ajustar la tabla del profesor y admin en pantallas muy pequenas (<640px).
- [x] **Accesibilidad**: anadir `aria-label` a botones de accion, asegurar contraste suficiente en badges. — Añadidos `aria-label`, `aria-live`, `role="dialog"`, `aria-modal`, `aria-labelledby` en teacher-dashboard, admin-dashboard, toast-container y confirm-dialog.
- [ ] **PWA / Service Worker**: si se quiere usar offline o en movil.

## Deuda tecnica

- [x] `app.component.spec.ts` tiene imports rotos — actualizar o eliminar. — Eliminado.
- [ ] Los `.scss` de componentes estan vacios — evaluar si se pueden eliminar y usar solo Tailwind inline.
- [ ] `saveAttendance()` en teacher envia N requests secuenciales (1 por alumno con incidencia). Considerar un endpoint batch en la API para enviar todas las faltas de una vez.
- [x] `UsersService` eliminado — no tenia importadores.

## Migración a API externa (completada)

- [x] Todos los environments apuntan a `https://apicharlasalumnostajamartesting.azurewebsites.net`
- [x] Flujo de login: POST /api/Auth/Login → GET /api/Usuarios/Perfil (two-step)
- [x] Servicios student/teacher/admin migrados a endpoints reales verificados
- [x] Porcentaje de asistencia calculado en frontend (festivos Madrid, Semana Santa dinámica)
- [x] Foto de perfil real desde campo `imagen` con fallback a iniciales
- [x] Avatares de alumnos en dashboards de profesor y admin

## Mejoras de UI/UX solicitadas

- [x] **Tipografía y layout**: Corregir saltos de línea no deseados en palabras largas y ajustar encaje de elementos en todos los dashboards.
- [x] **Modo claro/oscuro**: ThemeService con signal + localStorage, darkMode: 'class' en Tailwind CDN, dark: variants en todos los templates, toggle ☀/🌙 en el header.
- [ ] **Avatar circular en perfil**: El div del avatar del ProfileComponent no tiene forma perfectamente circular. Corregir con clases Tailwind adecuadas.
- [x] **Gráfico de asistencia en StudentDashboard**: Gráfico SVG de líneas (incidencias por semana), con área degradada y puntos, insertado debajo de las cards principales. Calculado en frontend con chartData computed a partir de incidencias().
- [x] **Racha de asistencia en Perfil**: Calculada en frontend a partir de incidencias() — días laborables (lun-vie) consecutivos sin faltas desde la última incidencia hasta hoy. Mostrada con número grande + barra horizontal (0-31 días) cuyo color va de cyan-verde (racha baja) a rojo (31 días, racha máxima). Mensajes contextuales por tramo. Solo visible para alumnos.
- [x] **Vista de calendario mensual de incidencias (Profesor)**: Calendario interactivo para revisar historial de faltas/retrasos/salidas de alumnos, navegable mes a mes dentro del rango del curso activo, con estadísticas mensuales y detalle por día seleccionado. Accesible desde dashboard del profesor.
