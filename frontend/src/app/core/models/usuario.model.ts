export type RolUsuario = 'ADMIN' | 'USER';

export interface UsuarioPublico {
    id: number;
    username: string;
    nombre: string;
    rol: RolUsuario;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioPublico;
}
