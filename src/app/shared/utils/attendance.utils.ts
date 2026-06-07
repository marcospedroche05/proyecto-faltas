import { AttendanceIncidentModel } from '../models/attendance-incident.model';

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function dateKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function offsetDate(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(base.getDate() + days);
  return d;
}

function madridHolidays(year: number): Set<string> {
  const h = new Set<string>();

  // Festivos nacionales fijos
  const fixed: [number, number][] = [
    [1, 1],   // Año Nuevo
    [1, 6],   // Reyes Magos
    [5, 1],   // Día del Trabajo
    [8, 15],  // Asunción de la Virgen
    [10, 12], // Fiesta Nacional de España
    [11, 1],  // Todos los Santos
    [12, 6],  // Día de la Constitución
    [12, 8],  // Inmaculada Concepción
    [12, 25], // Navidad
  ];
  for (const [month, day] of fixed) {
    h.add(dateKey(new Date(year, month - 1, day)));
  }

  // Comunidad de Madrid
  h.add(dateKey(new Date(year, 4, 2)));   // 2 de Mayo
  h.add(dateKey(new Date(year, 10, 9)));  // Almudena

  // Semana Santa (dinámica vía algoritmo de Computus)
  const easter = easterSunday(year);
  h.add(dateKey(offsetDate(easter, -3))); // Jueves Santo
  h.add(dateKey(offsetDate(easter, -2))); // Viernes Santo

  return h;
}

const holidayCache = new Map<number, Set<string>>();

function isWorkingDay(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const year = d.getFullYear();
  if (!holidayCache.has(year)) holidayCache.set(year, madridHolidays(year));
  return !holidayCache.get(year)!.has(dateKey(d));
}

export function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const fin = new Date(end);
  fin.setHours(0, 0, 0, 0);
  while (cur <= fin) {
    if (isWorkingDay(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function calcularPorcentajeAsistencia(
  faltas: AttendanceIncidentModel[],
  fechaInicio: string,
  fechaFin: string
): number {
  const start = new Date(fechaInicio);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rawEnd = new Date(fechaFin);
  rawEnd.setHours(0, 0, 0, 0);
  const end = rawEnd < today ? rawEnd : today;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 100;

  const totalDias = countWorkingDays(start, end);
  if (totalDias === 0) return 100;

  // Días únicos con incidencia que además son días laborables
  const diasConIncidencia = new Set(
    faltas
      .map(f => {
        const d = new Date(f.fechaIncidencia);
        d.setHours(0, 0, 0, 0);
        return isWorkingDay(d) ? dateKey(d) : null;
      })
      .filter((k): k is string => k !== null)
  ).size;

  const diasPresente = Math.max(0, totalDias - diasConIncidencia);
  return Math.round((diasPresente / totalDias) * 1000) / 10;
}
