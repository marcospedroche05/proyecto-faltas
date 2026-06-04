export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserDto {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: LoginUserDto;
}

export interface AuthSession {
  token: string;
  user: LoginUserDto;
}
