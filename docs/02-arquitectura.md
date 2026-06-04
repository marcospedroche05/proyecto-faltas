# 02 - Arquitectura

## Estructura de carpetas

```
src/app/
  core/                     → Servicios singleton, guards, interceptores
    auth/
      auth-session.service.ts   → Gestion de sesion (token + user en sessionStorage)
    guards/
      role.guard.ts             → Guard funcional basado en roles (string[])
    interceptors/
      auth.interceptor.ts       → Inyecta Bearer token en cada request
    services/
      auth.service.ts           → POST /api/auth/login
      student-api.service.ts    → Endpoints del alumno
      teacher-api.service.ts    → Endpoints del profesor
      admin-api.service.ts      → Endpoints del administrador
      users.service.ts          → GET /api/usuarios/{id}
  shared/
    models/                     → Interfaces TypeScript (DTOs del frontend)
      auth.model.ts
      user.model.ts
      course.model.ts
      attendance-incident.model.ts
  features/
    auth/login/                 → Componente de login
    student/dashboard/          → Dashboard del alumno
    teacher/dashboard/          → Dashboard del profesor
    admin/dashboard/            → Dashboard del administrador
    profile/                    → Perfil del usuario (comun a los 3 roles)
  environments/
    environment.ts              → apiBaseUrl: 'https://localhost:7151'
```

## Principios

1. **Standalone components**: todos los componentes usan `standalone: true`, sin `NgModule`.
2. **Signals**: estado local con `signal()` y `computed()` en vez de BehaviorSubject.
3. **Un servicio por rol**: `StudentApiService`, `TeacherApiService`, `AdminApiService` — cada uno encapsula los endpoints de su dominio.
4. **Interceptor unico**: `authInterceptor` anade el header `Authorization: Bearer <token>` a todas las requests.
5. **Guard funcional**: `roleGuard(roles: string[])` devuelve `CanActivateFn`. Redirige al dashboard correcto si el rol no coincide.

## Diagrama de flujo de autenticacion

```
LoginComponent
  └─ AuthService.login({ email, password })
       └─ POST /api/auth/login
            └─ { accessToken, expiresIn, user: LoginUserDto }
                 └─ AuthSessionService.setSession(token, user)
                      ├─ sessionStorage['tajamar.jwt'] = token
                      ├─ sessionStorage['tajamar.user'] = JSON.stringify(user)
                      └─ redirectPathForRole(role) → /student | /teacher | /admin
```
