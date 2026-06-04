# 01 - Vision general

## Que es ProyectoFaltas (Frontend)

Aplicacion Angular 17+ que sirve como frontend del sistema de control de asistencia del centro educativo Tajamar. Conecta con la API REST local `TajamarFaltasApi` para gestionar faltas, retrasos y salidas anticipadas.

## Objetivo

Sustituir el control de asistencia basado en Excel por una aplicacion web con tres vistas diferenciadas por rol:

- **Alumno**: consulta su historial de incidencias y porcentaje de asistencia.
- **Profesor**: pasa lista, registra incidencias y consulta el historial de sus cursos.
- **Administrador**: supervisa todos los cursos, gestiona justificaciones y elimina faltas.

## Contexto

- Es un proyecto de **pruebas** mientras se desarrolla la API externa real de Tajamar.
- La API backend corre en `https://localhost:7151`.
- No conecta con APIs externas; todos los datos son locales (SQL Server).
- Las passwords de prueba son `12345` (sin hashing).

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | Angular 17+ (standalone components) |
| Estilos | Tailwind CSS |
| Estado | Angular Signals (`signal`, `computed`) |
| HTTP | `HttpClient` con interceptor JWT |
| Almacenamiento sesion | `sessionStorage` (token + user JSON) |
| Backend | TajamarFaltasApi (.NET 8) en localhost:7151 |
