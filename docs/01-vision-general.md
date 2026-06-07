# 01 - Vision general

## Que es ProyectoFaltas (Frontend)

Aplicacion Angular 17+ que sirve como frontend del sistema de control de asistencia del centro educativo Tajamar. Conecta con la API REST externa `https://apicharlasalumnostajamartesting.azurewebsites.net` para gestionar faltas, retrasos y salidas anticipadas.

## Objetivo

Sustituir el control de asistencia basado en Excel por una aplicacion web con tres vistas diferenciadas por rol:

- **Alumno**: consulta su historial de incidencias y porcentaje de asistencia.
- **Profesor**: pasa lista, registra incidencias y consulta el historial de sus cursos.
- **Administrador**: supervisa todos los cursos, gestiona justificaciones y elimina faltas.

## Contexto

- Conecta con la API externa de Tajamar alojada en Azure.
- Las passwords de prueba son `12345`.
- El porcentaje de asistencia se calcula en el frontend: días lectivos (L-V) menos festivos de Madrid (nacionales + Comunidad + Semana Santa dinámica).

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | Angular 17+ (standalone components) |
| Estilos | Tailwind CSS |
| Estado | Angular Signals (`signal`, `computed`) |
| HTTP | `HttpClient` con interceptor JWT |
| Almacenamiento sesion | `sessionStorage` (token + user JSON) |
| Backend | API Azure en `apicharlasalumnostajamartesting.azurewebsites.net` |
