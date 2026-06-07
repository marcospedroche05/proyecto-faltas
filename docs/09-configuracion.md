# 09 - Configuracion

## Environment

Existen dos archivos de configuracion segun el entorno:

| Archivo | production | apiBaseUrl |
|---|---|---|
| `src/environments/environment.ts` | false | https://apicharlasalumnostajamartesting.azurewebsites.net |
| `src/environments/environment.development.ts` | false | https://apicharlasalumnostajamartesting.azurewebsites.net |
| `src/environments/environment.prod.ts` | true | https://apicharlasalumnostajamartesting.azurewebsites.net |

Todos los entornos apuntan a la API externa de Azure. Angular selecciona automaticamente `environment.prod.ts` al hacer build con `--configuration production`.

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

1. Frontend: `ng serve` (por defecto en `http://localhost:4200`).
2. La API externa en Azure debe ser accesible (no requiere setup local).
