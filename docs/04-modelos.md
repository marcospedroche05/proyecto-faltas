# 04 - Modelos (interfaces TypeScript)

## auth.model.ts

| Interface | Campos | Uso |
|---|---|---|
| `LoginRequest` | `email: string`, `password: string` | Body del POST /api/auth/login |
| `LoginUserDto` | `id`, `nombre`, `apellidos`, `email`, `role` (string) | Usuario devuelto en LoginResponse |
| `LoginResponse` | `accessToken`, `expiresIn`, `user: LoginUserDto` | Respuesta del login |
| `AuthSession` | `token: string`, `user: LoginUserDto` | Sesion almacenada en memoria y sessionStorage |

## user.model.ts

| Interface | Campos | Uso |
|---|---|---|
| `UserModel` | `id`, `nombre`, `apellidos`, `email`, `role` (string), `estadoUsuario` (boolean) | GET /api/usuarios/{id} |

## course.model.ts

| Interface | Campos | Uso |
|---|---|---|
| `CourseModel` | `idCurso`, `nombre`, `duracionHoras`, `activo?` | Cursos del alumno, profesor y admin |

## attendance-incident.model.ts

| Interface | Campos | Uso |
|---|---|---|
| `AttendanceIncidentModel` | `id`, `idUsuario`, `idCurso`, `fechaIncidencia`, `tipoFalta` (AttendanceType), `esJustificada`, `comentario?`, `nombreAlumno?`, `apellidosAlumno?` | Faltas del alumno y profesor |
| `AttendanceSummaryModel` | `idCurso`, `nombreCurso`, `totalHoras`, `horasFalta`, `porcentajeAsistencia` | Resumen asistencia alumno |
| `AlumnoModel` | `idUsuario`, `nombre`, `apellidos`, `email` | Lista de alumnos de un curso |
| `AdminFaltaModel` | `id`, `idAlumno`, `nombreAlumno`, `idCurso`, `nombreCurso`, `fecha`, `tipo`, `esJustificada`, `observaciones?` | Faltas vistas por el admin |

## Tipos auxiliares

```typescript
type AttendanceType = 'Falta' | 'Retraso' | 'Salida de antes';
```
