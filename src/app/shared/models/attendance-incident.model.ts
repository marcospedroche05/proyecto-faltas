import { CourseModel } from './course.model';

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

export interface VistaUsuarioCursoModel {
  idUsuario: number;
  usuario: string;
  nombre?: string;
  apellidos?: string;
  estadoUsuario: boolean;
  imagen: string;
  email: string;
  idRole: number;
  role: string;
  idCurso: number;
  curso: string;
  fechaInicioCurso: string;
  fechaFinCurso: string;
  idCursosUsuarios: number;
}

export interface AlumnoFaltasModel {
  usuario: VistaUsuarioCursoModel | null;
  faltas: AttendanceIncidentModel[];
}

export interface AlumnoCursoItemModel {
  alumno: VistaUsuarioCursoModel;
}

export interface CursosProfesorAlumnosModel {
  numeroAlumnos: number;
  curso: CourseModel;
  alumnos: AlumnoCursoItemModel[];
}

export interface AlumnoModel {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  email: string;
  imagen?: string;
}

export interface AdminFaltaModel {
  id: number;
  idAlumno: number;
  nombreAlumno: string;
  imagenAlumno?: string;
  idCurso: number;
  nombreCurso: string;
  fecha: string;
  tipo: string;
  esJustificada: boolean;
  observaciones?: string | null;
}
