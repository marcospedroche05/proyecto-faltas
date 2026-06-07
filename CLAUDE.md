# CLAUDE.md — ProyectoFaltas (Frontend Angular)

## Descripcion del proyecto

Frontend Angular 17+ para el sistema de control de asistencia del centro educativo Tajamar. Conecta con la API REST externa `https://apicharlasalumnostajamartesting.azurewebsites.net`.

Tres vistas diferenciadas por rol: Alumno (consulta faltas), Profesor (pase de lista), Administrador (gestion de justificaciones).

## Stack

| Tecnologia | Version / Detalle |
|---|---|
| Angular | 17+ (standalone components) |
| TypeScript | Strict mode |
| Tailwind CSS | Estilos inline en templates HTML |
| Estado | Angular Signals (`signal`, `computed`) |
| HTTP | `HttpClient` con interceptor JWT |
| Sesion | `sessionStorage` (token + user JSON) |
| API Backend | `https://apicharlasalumnostajamartesting.azurewebsites.net` (Azure, .NET) |

## Arquitectura

```
src/app/
  core/                     → Singleton: servicios, guards, interceptores
    auth/                   → AuthSessionService (gestion de sesion)
    guards/                 → roleGuard (funcional, roles como strings)
    interceptors/           → authInterceptor (Bearer token)
    services/               → AuthService, StudentApi, TeacherApi, AdminApi
  shared/
    models/                 → Interfaces TypeScript (auth, user, course, attendance)
  features/
    auth/login/             → LoginComponent
    student/dashboard/      → StudentDashboardComponent
    teacher/dashboard/      → TeacherDashboardComponent
    admin/dashboard/        → AdminDashboardComponent
    profile/                → ProfileComponent (comun a los 3 roles)
  environments/
    environment.ts          → apiBaseUrl: 'https://apicharlasalumnostajamartesting.azurewebsites.net'
```

## Convenciones de codigo

- **Standalone components**: siempre `standalone: true`. Sin NgModules.
- **Signals**: `signal()` y `computed()` para estado local. No BehaviorSubject.
- **Inyeccion**: `inject()` en vez de constructor injection.
- **Servicios**: `@Injectable({ providedIn: 'root' })`.
- **Modelos**: interfaces puras en `shared/models/`. Un archivo por dominio.
- **URLs de API**: desde `environment.apiBaseUrl`. Nunca hardcodear.
- **Archivos**: kebab-case (`student-api.service.ts`).
- **Interfaces**: PascalCase con sufijo descriptivo (`LoginRequest`, `CourseModel`).
- **Roles**: strings (`"Alumno"`, `"Profesor"`, `"Administrador"`), nunca numeros.
- **trackBy**: obligatorio en todo `*ngFor`.
- **Estilos**: Tailwind inline en HTML. Los `.scss` estan vacios.

## Documentacion

La carpeta `docs/` contiene documentacion atomica del proyecto. **Leer siempre antes de implementar.**

| Archivo | Contenido |
|---|---|
| `docs/01-vision-general.md` | Contexto, objetivo, stack |
| `docs/02-arquitectura.md` | Estructura de carpetas, principios, diagrama auth |
| `docs/03-roles-y-rutas.md` | Roles, rutas, guard funcional |
| `docs/04-modelos.md` | Interfaces TypeScript con campos y uso |
| `docs/05-servicios-api.md` | Servicios HTTP, metodos, endpoints |
| `docs/06-autenticacion.md` | Flujo login, AuthSessionService, interceptor JWT |
| `docs/07-componentes.md` | Los 5 componentes: logica, signals, vistas |
| `docs/08-estilos-y-diseno.md` | Paleta de colores, patrones UI, responsive |
| `docs/09-configuracion.md` | Environment, app config, requisitos |
| `docs/10-refactorizacion-completada.md` | Registro de la refactorizacion desde API externa |
| `docs/11-pendientes.md` | Tareas pendientes priorizadas |

---

# Sistema multi-agente

## Principios generales

1. **Tu (Claude Code) eres el Orquestador.** Planificas, delegas y validas. Usas modelo Opus.
2. **Antes de cualquier tarea, lee `docs/11-pendientes.md` y la documentacion relevante.** Si algo no esta claro, pregunta al usuario antes de implementar.
3. **Delega trabajo a agentes especializados** definidos en `.claude/agents/`. Cada agente tiene su propio archivo con rol, modelo y contexto completo.
4. **Al terminar cada tarea, lanza el agente de documentacion** para actualizar `docs/`.
5. **Nunca asumas.** Si la documentacion es ambigua o contradice el codigo, pregunta al usuario.

## Agentes disponibles

Los agentes estan definidos en `.claude/agents/`:

| Agente | Archivo | Modelo | Responsabilidad |
|---|---|---|---|
| **Orquestador** | `.claude/agents/orquestador.md` | Opus | Planifica, coordina, delega y supervisa. Agente principal. |
| **Implementador** | `.claude/agents/implementador.md` | Sonnet | TypeScript: componentes, servicios, guards, interceptores, modelos |
| **Estilos** | `.claude/agents/estilos.md` | Sonnet | Tailwind CSS, templates HTML, maquetacion, responsive, UI/UX |
| **Documentacion** | `.claude/agents/documentacion.md` | Haiku | Actualiza `docs/` tras cada tarea completada |
| **Revisor** | `.claude/agents/revisor.md` | Opus | Revisa coherencia, convenciones, accesibilidad antes de cerrar features |

### Como invocar agentes

Usa la herramienta `Agent` con el campo `model` correspondiente. El prompt debe incluir:
- La tarea concreta con criterios de aceptacion.
- Los archivos que necesita leer o modificar.
- El contexto minimo necesario (no duplicar lo que ya tiene en su archivo de agente).

Ejemplo:
```
Agent({
  description: "Implementar servicio de notificaciones",
  subagent_type: "Implementador",
  model: "sonnet",
  prompt: "Lee .claude/agents/implementador.md para tu rol e instrucciones.\n\nTAREA: Crear NotificationService que muestre toasts de exito/error...\n\nARCHIVOS: ..."
})
```

## Flujo de trabajo del orquestador

Cuando el usuario pida implementar algo, sigue este flujo:

```
1. ANALIZAR
   ├── Lee docs/11-pendientes.md
   ├── Lee la documentacion relevante (docs/)
   ├── Identifica archivos afectados con Glob/Grep
   └── Si hay ambiguedad → PREGUNTA al usuario

2. PLANIFICAR
   ├── Descompone la tarea en subtareas
   ├── Identifica que agentes necesita
   ├── Determina el orden:
   │     Modelos → Servicios → Componentes (.ts) → Templates (.html)
   └── Presenta el plan al usuario si la tarea es grande (>3 archivos)

3. EJECUTAR
   ├── Modelos nuevos → Agente Implementador primero
   ├── Servicios/logica → Agente Implementador
   ├── Templates/estilos → Agente Estilos
   ├── Subtareas independientes → lanza agentes en paralelo
   └── Cada agente recibe contexto completo (archivos, convenciones, tarea)

4. VALIDAR
   ├── Verifica que compila: ng build
   ├── Si es feature compleja → Agente Revisor
   └── Resuelve hallazgos criticos antes de continuar

5. DOCUMENTAR
   └── Lanza Agente Documentacion con resumen de los cambios realizados

6. REPORTAR
   └── Resume al usuario: que se hizo, que archivos cambiaron, que queda pendiente
```

### Ejemplo de orquestacion

Si el usuario pide: "Anade confirmacion antes de eliminar faltas"

1. **Lees** `docs/07-componentes.md` y `docs/11-pendientes.md`
2. **Planificas**: componente dialog reutilizable + integrar en teacher y admin dashboards
3. **Agente Implementador** (sonnet): crea ConfirmDialogComponent con signal de visibilidad
4. **Agente Estilos** (sonnet): template HTML del dialog con la paleta del proyecto
5. **Agente Implementador** (sonnet): integra el dialog en teacher y admin dashboards
6. **Compilas**: `ng build`
7. **Agente Revisor** (opus): revisa coherencia si es feature compleja
8. **Agente Documentacion** (haiku): actualiza docs/07 y docs/11
9. **Reportas** al usuario

## Reglas criticas

- **URL de API desde `environment.apiBaseUrl`**. Nunca hardcodear. La API es `https://apicharlasalumnostajamartesting.azurewebsites.net`.
- **Compilar siempre** despues de cambios de codigo: `ng build` desde la raiz del proyecto.
- **Preguntar antes de actuar** si la documentacion no cubre el caso.
- **Standalone components siempre.** No crear NgModules.
- **Mantener el diseno visual** existente salvo que el usuario pida cambios de diseno.
- **Roles como strings**, nunca numeros.
