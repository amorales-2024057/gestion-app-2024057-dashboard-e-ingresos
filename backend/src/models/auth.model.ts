import { UsuarioPublico } from './usuario.model';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioPublico;
}

export interface JwtPayload {
    id: number;
    username: string;
    rol: 'ADMIN' | 'USER';
}
