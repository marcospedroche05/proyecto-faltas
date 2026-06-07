export interface CourseModel {
  idCurso: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo?: boolean;
  duracionHoras?: number;
}
