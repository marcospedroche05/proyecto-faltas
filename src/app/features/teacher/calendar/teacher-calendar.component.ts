import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { TeacherApiService } from '../../../core/services/teacher-api.service';
import { CourseModel } from '../../../shared/models/course.model';
import { AttendanceIncidentModel, AttendanceType, CursosProfesorAlumnosModel } from '../../../shared/models/attendance-incident.model';

export interface MonthOption {
  year: number;
  month: number;
  label: string;
}

export interface CalendarDay {
  date: Date;
  enMes: boolean;
  finDeSemana: boolean;
  esHoy: boolean;
  incidencias: AttendanceIncidentModel[];
}

export interface MonthStats {
  totalIncidencias: number;
  faltas: number;
  retrasos: number;
  salidas: number;
  diasConIncidencias: number;
  alumnosAfectados: number;
}

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

@Component({
  selector: 'app-teacher-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-calendar.component.html',
  styleUrl: './teacher-calendar.component.scss'
})
export class TeacherCalendarComponent implements OnInit {
  private readonly teacherApi = inject(TeacherApiService);

  private readonly cursosConAlumnos = signal<CursosProfesorAlumnosModel[]>([]);
  readonly courses = signal<CourseModel[]>([]);
  readonly activeCourseId = signal<number | null>(null);
  readonly historial = signal<AttendanceIncidentModel[]>([]);
  readonly loading = signal(true);

  readonly selectedMonth = signal<MonthOption | null>(null);
  readonly selectedDay = signal<Date | null>(null);

  readonly weekdayLabels = WEEKDAY_LABELS;

  readonly activeCourse = computed(() => this.courses().find(c => c.idCurso === this.activeCourseId()) ?? null);

  readonly availableMonths = computed<MonthOption[]>(() => {
    const course = this.activeCourse();
    if (!course) return [];

    const start = new Date(course.fechaInicio);
    const end = new Date(course.fechaFin);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

    const months: MonthOption[] = [];
    let year = start.getFullYear();
    let month = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    while (year < endYear || (year === endYear && month <= endMonth)) {
      months.push({ year, month, label: `${MONTH_LABELS[month]} ${year}` });
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    return months;
  });

  readonly calendarWeeks = computed<CalendarDay[][]>(() => {
    const monthOption = this.selectedMonth();
    if (!monthOption) return [];

    const { year, month } = monthOption;
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - mondayIndex(firstOfMonth));

    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(gridEnd.getDate() + (6 - mondayIndex(lastOfMonth)));

    const today = startOfDay(new Date());
    const incidencias = this.historial();

    const days: CalendarDay[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const date = startOfDay(cursor);
      const dayIncidencias = incidencias.filter(i => isSameDay(new Date(i.fechaIncidencia), date));
      const dow = date.getDay();

      days.push({
        date,
        enMes: date.getMonth() === month,
        finDeSemana: dow === 0 || dow === 6,
        esHoy: isSameDay(date, today),
        incidencias: dayIncidencias
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  });

  readonly selectedDayIncidents = computed<AttendanceIncidentModel[]>(() => {
    const day = this.selectedDay();
    if (!day) return [];
    return this.historial().filter(i => isSameDay(new Date(i.fechaIncidencia), day));
  });

  readonly monthStats = computed<MonthStats>(() => {
    const monthOption = this.selectedMonth();
    if (!monthOption) {
      return { totalIncidencias: 0, faltas: 0, retrasos: 0, salidas: 0, diasConIncidencias: 0, alumnosAfectados: 0 };
    }

    const { year, month } = monthOption;
    const incidenciasDelMes = this.historial().filter(i => {
      const fecha = new Date(i.fechaIncidencia);
      return fecha.getFullYear() === year && fecha.getMonth() === month;
    });

    const tipoCount: Record<AttendanceType, number> = {
      'Falta': 0,
      'Retraso': 0,
      'Salida de antes': 0
    };
    const dias = new Set<string>();
    const alumnos = new Set<number>();

    for (const incidencia of incidenciasDelMes) {
      tipoCount[incidencia.tipoFalta] = (tipoCount[incidencia.tipoFalta] ?? 0) + 1;
      const fecha = startOfDay(new Date(incidencia.fechaIncidencia));
      dias.add(fecha.toISOString());
      alumnos.add(incidencia.idUsuario);
    }

    return {
      totalIncidencias: incidenciasDelMes.length,
      faltas: tipoCount['Falta'],
      retrasos: tipoCount['Retraso'],
      salidas: tipoCount['Salida de antes'],
      diasConIncidencias: dias.size,
      alumnosAfectados: alumnos.size
    };
  });

  ngOnInit(): void {
    this.teacherApi.getCursosConAlumnos().subscribe({
      next: (cursosData) => {
        this.cursosConAlumnos.set(cursosData);
        const courses = cursosData.map(c => c.curso);
        this.courses.set(courses);
        if (courses.length > 0) {
          this.selectCourse(courses[0].idCurso);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading teacher courses', err);
        this.loading.set(false);
      }
    });
  }

  selectCourse(courseId: number): void {
    this.activeCourseId.set(courseId);
    this.selectedDay.set(null);

    this.teacherApi.getFaltasDeCurso(courseId).subscribe({
      next: (faltas) => {
        this.historial.set(faltas);
        this.selectDefaultMonth();
      },
      error: () => {
        this.historial.set([]);
        this.selectDefaultMonth();
      }
    });
  }

  private selectDefaultMonth(): void {
    const months = this.availableMonths();
    if (months.length === 0) {
      this.selectedMonth.set(null);
      return;
    }

    const today = new Date();
    const current = months.find(m => m.year === today.getFullYear() && m.month === today.getMonth());
    this.selectedMonth.set(current ?? months[0]);
  }

  selectMonth(option: MonthOption): void {
    this.selectedMonth.set(option);
    this.selectedDay.set(null);
  }

  selectDay(day: CalendarDay): void {
    if (!day.enMes) return;
    const current = this.selectedDay();
    this.selectedDay.set(current && isSameDay(current, day.date) ? null : day.date);
  }

  goToPreviousMonth(): void {
    this.shiftMonth(-1);
  }

  goToNextMonth(): void {
    this.shiftMonth(1);
  }

  private shiftMonth(offset: number): void {
    const months = this.availableMonths();
    const current = this.selectedMonth();
    if (!current || months.length === 0) return;

    const index = months.findIndex(m => m.year === current.year && m.month === current.month);
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= months.length) return;

    this.selectMonth(months[nextIndex]);
  }

  trackByCourse = (_index: number, course: CourseModel) => course.idCurso;
  trackByMonth = (_index: number, option: MonthOption) => `${option.year}-${option.month}`;
  trackByWeek = (index: number, _week: CalendarDay[]) => index;
  trackByDay = (_index: number, day: CalendarDay) => day.date.toISOString();
  trackByIncident = (_index: number, incident: AttendanceIncidentModel) => incident.id;
}
