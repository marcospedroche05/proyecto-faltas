export type AttendanceType = 'Falta' | 'Retraso' | 'Salida de antes';

export interface AttendanceIncidentModel {
  id: number;
  idUsuario: number;
  idCurso: number;
  fechaIncidencia: string;
  tipoFalta: AttendanceType;
  esJustificada: boolean;
  comentario?: string | null;
  nombreAlumno?: string;
  apellidosAlumno?: string;
}

export interface AttendanceSummaryModel {
  idCurso: number;
  nombreCurso: string;
  totalHoras: number;
  horasFalta: number;
  porcentajeAsistencia: number;
}

export interface AlumnoModel {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  email: string;
}

export interface AdminFaltaModel {
  id: number;
  idAlumno: number;
  nombreAlumno: string;
  idCurso: number;
  nombreCurso: string;
  fecha: string;
  tipo: string;
  esJustificada: boolean;
  observaciones?: string | null;
}
