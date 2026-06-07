export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  response: string;
  role: string;
  idrole: number;
}

export interface UserProfileDto {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  email: string;
  estadoUsuario: boolean;
  imagen: string;
  idRole: number;
  role: string;
  idCurso: number;
  curso: string;
  idCursoUsuario: number;
}

export interface UserProfileResponse {
  usuario: UserProfileDto;
}

export interface LoginUserDto {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  role: string;
  imagen?: string;
}

export interface AuthSession {
  token: string;
  user: LoginUserDto;
}
