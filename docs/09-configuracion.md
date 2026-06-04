# 09 - Configuracion

## Environment

Existen dos archivos de configuracion segun el entorno:

| Archivo | production | apiBaseUrl |
|---|---|---|
| `src/environments/environment.ts` | false | http://localhost:5209 |
| `src/environments/environment.prod.ts` | true | https://api.tajamar.es |

**Desarrollo**:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5209'
};
```

La API backend debe estar corriendo en `http://localhost:5209` con CORS habilitado para el origen del frontend (normalmente `http://localhost:4200`).

**Produccion**:
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.tajamar.es'
};
```

Angular selecciona automaticamente `environment.prod.ts` al hacer build con `--configuration production`.

## App Config

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

- `provideZoneChangeDetection({ eventCoalescing: true })`: optimizacion de deteccion de cambios.
- `provideRouter(routes)`: registro de rutas standalone.
- `provideHttpClient(withInterceptors([authInterceptor]))`: HTTP client con interceptor JWT.

## Dependencias clave

- Angular 17+ (standalone components, signals)
- Tailwind CSS
- FormsModule (template-driven forms en login, teacher y admin)
- CommonModule (ngIf, ngFor, ngClass, date pipe)

## Sesion

- Token JWT en `sessionStorage['tajamar.jwt']`.
- Datos de usuario en `sessionStorage['tajamar.user']` como JSON.
- Se pierde al cerrar la pestana del navegador.

## Requisitos para ejecutar

1. API backend corriendo: `dotnet run` en `TajamarFaltas.Api`.
2. Frontend: `ng serve` (por defecto en `http://localhost:4200`).
3. CORS configurado en la API para aceptar el origen del frontend.
