# 05 - Servicios API

Todos los servicios usan `inject(HttpClient)` y construyen URLs desde `environment.apiBaseUrl`.

## AuthService

| Metodo | HTTP | Endpoint | Request | Response |
|---|---|---|---|---|
| `login(credentials)` | POST | `/api/auth/login` | `LoginRequest` | `LoginResponse` |

## StudentApiService

| Metodo | HTTP | Endpoint | Response |
|---|---|---|---|
| `getMisFaltas()` | GET | `/api/faltas/mis-faltas` | `AttendanceIncidentModel[]` |
| `getMisCursos()` | GET | `/api/faltas/mis-cursos` | `CourseModel[]` |
| `getResumenAsistencia()` | GET | `/api/faltas/resumen-asistencia` | `AttendanceSummaryModel[]` |

## TeacherApiService

Endpoints reales de la API externa (`environment.apiBaseUrl`):

| Metodo | HTTP | Endpoint | Request/Response |
|---|---|---|---|
| `getCursosConAlumnos()` | GET | `/api/Profesor/AlumnosCursoActivoProfesor` | `CursosProfesorAlumnosModel[]` (curso + alumnos anidados) |
| `getAlumnosCursoRandom()` | GET | `/api/Profesor/AlumnosCursoActivoProfesorRandom` | `VistaUsuarioCursoModel[]` (lista plana, incluye `idCursosUsuarios` correcto por alumno) |
| `getMisCursos()` | — | derivado de `getCursosConAlumnos()` | `CourseModel[]` |
| `getFaltasDeCurso(idCurso)` | GET | `/api/FaltasAlumno/FaltasCurso` | `AttendanceIncidentModel[]` (scopeado por JWT del profesor; no usa `idCurso`) |
| `crearFalta(request)` | POST | `/api/FaltasAlumno/CreateFaltaAlumno` | `CreateFaltaRequest` → `void` |
| `eliminarFalta(id)` | DELETE | `/api/FaltasAlumno/DeleteFaltaAlumno?idfalta={id}` | `void` |

### CreateFaltaRequest

```typescript
{ idCursosUsuarios, idCurso, fechaIncidencia (ISO string), tipoFalta, comentario? }
```

**⚠️ Quirk confirmado de la API**: el endpoint `CreateFaltaAlumno` espera un body con el campo `idUsuario` (segun su esquema Swagger), pero internamente lo resuelve como `idCursosUsuarios` (el id de matricula del alumno en el curso, NO su `idUsuario` real). Por eso `crearFalta()` envia `idUsuario: request.idCursosUsuarios` en el body — el nombre del campo se mantiene (`idUsuario`) pero el valor es el `idCursosUsuarios` del alumno, obtenido de `getAlumnosCursoRandom()`. Enviar el `idUsuario` real provoca que la falta se asigne a otro alumno.

## AdminApiService

Endpoints reales de la API externa (`environment.apiBaseUrl`):

| Metodo | HTTP | Endpoint | Request/Response |
|---|---|---|---|
| `getCursos()` | GET | `/api/Cursos` | `CourseModel[]` |
| `getAlumnosDeCurso(idCurso)` | GET | `/api/Admin/UsuariosActivos` | `AlumnoModel[]` (filtrado en cliente por `idCurso` y `idRole === 2`) |
| `getFaltasDeCurso(idCurso)` | GET | `/api/FaltasAlumno/FaltasCursoAdmin?idCurso={idCurso}` | `AdminFaltaModel[]` |
| `getAllFaltas()` | GET | `/api/FaltasAlumno/FaltasCurso` | `AdminFaltaModel[]` |
| `updateJustificacion(id, val)` | PUT | `/api/FaltasAlumno/UpdateJustificacionFalta?idfalta={id}&esjustificada={val}` | `void` |
| `eliminarFalta(id)` | DELETE | `/api/FaltasAlumno/DeleteFaltaAlumnoAdmin?idfalta={id}` | `void` |

**Nota — `getFaltasDeCurso` y `eliminarFalta` (admin)**: usan los endpoints especificos `FaltasCursoAdmin` (acepta `idCurso` por query) y `DeleteFaltaAlumnoAdmin`, implementados por el backend para el rol Administrador. Antes de su existencia, ambos metodos llamaban a `/api/FaltasAlumno/FaltasCurso` / `/api/FaltasAlumno/DeleteFaltaAlumno` (variantes scopeadas al profesor via JWT), lo que provocaba que el desplegable de cursos del dashboard de admin no cargara incidencias.

**Limitacion conocida — `getAllFaltas()`**: sigue llamando a `/api/FaltasAlumno/FaltasCurso` (scopeado al profesor), por lo que probablemente devuelve vacio para un admin. Esto afecta a las tarjetas de resumen (`snapshot()`) y al panel "Incidencias no justificadas" en el dashboard de admin, que dependen de `allFaltas`. Pendiente: el backend deberia exponer un endpoint equivalente a `FaltasCursoAdmin` pero para todas las incidencias (sin filtrar por curso).

## UsersService

| Metodo | HTTP | Endpoint | Response |
|---|---|---|---|
| `getUserById(id)` | GET | `/api/usuarios/{id}` | `UserModel` |

## NotificationService

**Ruta**: `src/app/core/services/notification.service.ts`

Servicio global de notificaciones tipo toast. Inyectado en interceptor y componentes.

| Método | Tipo | Descripción |
|---|---|---|
| `success(message)` | Éxito (emerald) | Operación completada correctamente |
| `error(message)` | Error (rose) | Fallo en operación o error HTTP |
| `info(message)` | Info (cyan) | Mensaje informativo neutral |
| `dismiss(id)` | — | Elimina un toast por su id |

- `notifications`: `Signal<AppNotification[]>` (readonly) — leído por `ToastContainerComponent`
- Auto-dismiss: 4000ms por setTimeout interno

## ConfirmDialogService

**Ruta**: `src/app/core/services/confirm-dialog.service.ts`

Servicio global para mostrar modales de confirmación antes de acciones destructivas.

| Método | Descripción |
|---|---|
| `open(message, onConfirm)` | Abre el modal con el mensaje dado; ejecuta onConfirm si el usuario confirma |
| `confirm()` | Ejecuta el callback y cierra el modal |
| `close()` | Cierra el modal sin ejecutar la acción |

- `isOpen`: `Signal<boolean>` (readonly) — leído por `ConfirmDialogComponent`
- `message`: `Signal<string>` (readonly) — mensaje a mostrar en el modal
