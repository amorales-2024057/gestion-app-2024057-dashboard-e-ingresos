import { GeneroUsuario, UsuarioPublico } from './usuario.model';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioPublico;
}

// Datos que llegan desde el boton "Crear cuenta" del login. El rol
// siempre se asigna como 'USER' en el backend: nadie puede
// autopromoverse a ADMIN a traves del registro publico.
export interface RegistroRequest {
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    username: string;
    password: string;
    telefono?: string | null;
}

export interface JwtPayload {
    id: number;
    username: string;
    rol: 'ADMIN' | 'USER';
}
