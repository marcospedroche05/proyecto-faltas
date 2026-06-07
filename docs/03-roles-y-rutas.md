# 03 - Roles y rutas

## Roles del sistema

Los roles se manejan como **strings** (no numeros). Vienen en el campo `role` del `LoginUserDto` devuelto por la API.

| Rol | Valor string | Ruta | Componente |
|---|---|---|---|
| Alumno | `"Alumno"` | `/student` | `StudentDashboardComponent` |
| Profesor | `"Profesor"` | `/teacher` | `TeacherDashboardComponent` |
| Administrador | `"Administrador"` | `/admin` | `AdminDashboardComponent` |

## Tabla de rutas (`app.routes.ts`)

| Path | Componente | Guard |
|---|---|---|
| `/` | Redirect → `/login` | — |
| `/login` | `LoginComponent` | — |
| `/profile` | `ProfileComponent` | `roleGuard(['Profesor', 'Alumno', 'Administrador'])` |
| `/student` | `StudentDashboardComponent` | `roleGuard(['Alumno'])` |
| `/teacher` | `TeacherDashboardComponent` | `roleGuard(['Profesor'])` |
| `/teacher/calendario` | `TeacherCalendarComponent` | `roleGuard(['Profesor'])` |
| `/admin` | `AdminDashboardComponent` | `roleGuard(['Administrador'])` |
| `**` | Redirect → `/login` | — |

## Guard funcional

```typescript
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const role = authSession.getRole();
    if (role && allowedRoles.includes(role)) return true;
    return router.createUrlTree([authSession.redirectPathForRole(role)]);
  };
};
```

Si el usuario no tiene el rol permitido, se le redirige a su dashboard correspondiente (no al login).
