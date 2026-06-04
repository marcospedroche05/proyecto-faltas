# 06 - Autenticacion y sesion

## Flujo de login

1. El usuario introduce **email** y **password** en `LoginComponent`.
2. `AuthService.login()` envia `POST /api/auth/login` con `{ email, password }`.
3. La API devuelve `{ accessToken, expiresIn, user: LoginUserDto }`.
4. `AuthSessionService.setSession(token, user)` guarda:
   - `sessionStorage['tajamar.jwt']` → el token JWT.
   - `sessionStorage['tajamar.user']` → el user como JSON string.
   - `sessionSignal` → el objeto `AuthSession` en memoria.
5. `redirectPathForRole(role)` redirige al dashboard correspondiente.

## AuthSessionService

Servicio singleton (`providedIn: 'root'`) que centraliza la gestion de sesion.

### Almacenamiento

- **sessionStorage** (se pierde al cerrar pestana).
- **Signal reactivo** (`sessionSignal`) para binding en templates.
- Al cargar la app, `restoreSession()` intenta recuperar sesion de sessionStorage.

### Metodos publicos

| Metodo | Devuelve | Descripcion |
|---|---|---|
| `setSession(token, user)` | `void` | Guarda token y user |
| `clear()` | `void` | Limpia sesion (logout) |
| `getToken()` | `string \| null` | Token JWT |
| `getUser()` | `LoginUserDto \| null` | Datos del usuario |
| `getRole()` | `string \| null` | Rol como string |
| `getUserId()` | `number \| null` | ID del usuario |
| `getUserDisplayName()` | `string` | "Nombre Apellidos" o email |
| `redirectPathForRole(role)` | `string` | Path segun rol |

### Propiedades reactivas

- `session`: computed del sessionSignal.
- `isAuthenticated`: computed booleano.

## Interceptor JWT

`authInterceptor` (funcional, `HttpInterceptorFn`) anade `Authorization: Bearer <token>` a cada request salvo si ya tiene el header.

Registrado en `appConfig`:

```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

## Notas

- **No se decodifica el JWT** en el frontend. El role viene directamente en `LoginUserDto.role`.
- La sesion se almacena en `sessionStorage`, no `localStorage` — se pierde al cerrar la pestana.
