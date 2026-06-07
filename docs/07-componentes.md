# 07 - Componentes

## AppComponent

Shell de la aplicacion. Contiene:
- Header con navegacion (Login, Perfil, boton Salir).
- `<router-outlet>` para cargar vistas.
- Fondo decorativo con gradientes blur.
- Usa `isAuthenticated()` para mostrar/ocultar botones.

## LoginComponent

- Formulario con campos `email` y `password` (FormsModule, ngModel).
- Llama a `AuthService.login()`, guarda sesion y redirige.
- Muestra `errorMessage` si falla.
- Diseno split: info a la izquierda, formulario a la derecha.

## StudentDashboardComponent

- Carga datos con `forkJoin` de 3 endpoints: `getMisFaltas`, `getMisCursos`, `getResumenAsistencia`.
- **Panel superior**: nombre, email, curso actual, 4 tarjetas (asistencia %, incidencias, justificadas, no justificadas).
- **Resumen por curso**: anillo de progreso + barras por curso con porcentaje de asistencia (verde >= 80%, ambar >= 60%, rojo < 60%).
- **Incidencias recientes**: lista scrollable con tipo, fecha, estado de justificacion, comentario.
- Signals: `cursos`, `incidencias`, `resumen`, `loading`.
- Computed: `summary`, `progressStyle`, `cursoActual`.

## TeacherDashboardComponent

- Carga cursos asignados al profesor al iniciar. Autoselecciona el primero.
- **Panel izquierdo**: lista de cursos (botones), pase masivo (4 botones: todos presentes/falta/retraso/salida), boton "Guardar pase de lista".
- **Panel derecho**: tabla de alumnos con select de estado (`presente`/`falta`/`retraso`/`salida`) y campo comentario.
- **Historial**: grid de incidencias registradas con boton de eliminar.
- `saveAttendance()` envia un `POST /api/profesor/faltas` por cada alumno con estado != presente.
- Signals: `courses`, `activeCourseId`, `students` (RosterStudent[]), `historial`, `statusMessage`, `loading`.
- Tipos auxiliares: `AttendanceMark`, `RosterStudent`, `attendanceMarkLabels`, `attendanceTypeForMark`.

## TeacherCalendarComponent

- Calendario mensual interactivo para revisar el historial de incidencias (faltas, retrasos, salidas) de alumnos del profesor.
- Accesible desde dashboard del profesor mediante enlace "Ver historial mensual".
- **Selector de curso**: botones para cambiar entre cursos asignados (mismo patron que TeacherDashboardComponent).
- **Navegador de mes**: anterior/siguiente + chips de meses disponibles dentro del rango de fechas del curso.
- **Estadisticas del mes**: 6 tarjetas (total incidencias, faltas, retrasos, salidas, dias con incidencias, alumnos afectados).
- **Cuadricula de calendario**: tabla con dias de la semana en cabecera, celdas clicables con badges coloreados segun nº de incidencias, dia actual resaltado, fines de semana marcados, dias fuera de mes atenuados.
- **Panel de detalle**: muestra las incidencias del dia seleccionado (alumno, tipo con badge, estado justificacion, comentario opcional).
- Signals: `courses`, `activeCourseId`, `activeCourse`, `selectedMonth`, `selectedDay`, `historial`, `loading`.
- Computed: `availableMonths`, `calendarWeeks`, `monthStats`, `selectedDayIncidents`.

## AdminDashboardComponent

- Carga todos los cursos y todas las faltas al iniciar.
- **Snapshot**: 4 tarjetas (cursos, total faltas, justificadas, pendientes).
- **Incidencias no justificadas**: lista de las primeras 6 pendientes con boton "Justificar".
- **Gestion por curso**: selector de curso → tabla con alumno, tipo, fecha, estado justificacion, acciones (justificar/deshacer, eliminar).
- `toggleJustificada()` envia `PATCH /api/admin/faltas/{id}/justificacion`.
- `deleteFalta()` envia `DELETE /api/admin/faltas/{id}`.
- Actualiza `allFaltas` y `courseFaltas` localmente tras cada operacion.

## ProfileComponent

- Comun a los 3 roles. Muestra datos del usuario (avatar con iniciales, nombre, email, rol).
- **Solo para alumnos**: carga incidencias y resumen de asistencia.
  - Tarjetas: incidencias, justificadas, no justificadas.
  - Asistencia media (promedio de `porcentajeAsistencia` de todos los cursos).
  - Ultima incidencia + lista de ultimos 8 registros.
- Para profesores y admins: mensaje informativo.

## ToastContainerComponent

**Ruta**: `src/app/shared/toast/toast-container.component.ts`
**Selector**: `<app-toast-container>`

Componente de notificaciones globales, integrado en `app.component.html`.

- Muestra toasts apilados en la esquina inferior derecha (`fixed bottom-6 right-6`)
- Colores: emerald (éxito), rose (error), cyan (info)
- Auto-dismiss a los 4s (gestionado por `NotificationService`)
- Botón ✕ para cerrar manualmente cada toast

## ConfirmDialogComponent

**Ruta**: `src/app/shared/confirm-dialog/confirm-dialog.component.ts`
**Selector**: `<app-confirm-dialog>`

Modal de confirmación global, integrado en `app.component.html`.

- Overlay con `fixed inset-0 z-50` y backdrop blur
- Botones: Cancelar (neutral) y Eliminar (rose-500)
- Estado gestionado por `ConfirmDialogService`
- Uso: `confirmDialog.open('mensaje', () => accion())`
