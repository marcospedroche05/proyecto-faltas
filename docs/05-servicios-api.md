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

| Metodo | HTTP | Endpoint | Request/Response |
|---|---|---|---|
| `getMisCursos()` | GET | `/api/profesor/cursos` | `CourseModel[]` |
| `getAlumnosDeCurso(id)` | GET | `/api/profesor/cursos/{id}/alumnos` | `AlumnoModel[]` |
| `getFaltasDeCurso(id)` | GET | `/api/profesor/cursos/{id}/faltas` | `AttendanceIncidentModel[]` |
| `crearFalta(request)` | POST | `/api/profesor/faltas` | `CreateFaltaRequest` → `AttendanceIncidentModel` |
| `eliminarFalta(id)` | DELETE | `/api/profesor/faltas/{id}` | `void` |

### CreateFaltaRequest

```typescript
{ idUsuario, idCurso, fechaIncidencia (ISO string), tipoFalta, comentario? }
```

## AdminApiService

| Metodo | HTTP | Endpoint | Request/Response |
|---|---|---|---|
| `getCursos()` | GET | `/api/admin/cursos` | `CourseModel[]` |
| `getAlumnosDeCurso(id)` | GET | `/api/admin/cursos/{id}/alumnos` | `AlumnoModel[]` |
| `getFaltasDeCurso(id)` | GET | `/api/admin/cursos/{id}/faltas` | `AdminFaltaModel[]` |
| `getAllFaltas()` | GET | `/api/admin/faltas` | `AdminFaltaModel[]` |
| `updateJustificacion(id, val)` | PATCH | `/api/admin/faltas/{id}/justificacion` | `{ esJustificada: boolean }` → `void` |
| `eliminarFalta(id)` | DELETE | `/api/admin/faltas/{id}` | `void` |

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
