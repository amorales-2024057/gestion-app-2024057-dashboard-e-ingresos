export type RolUsuario = 'ADMIN' | 'USER';

export interface Usuario {
    id: number;
    username: string;
    password: string;
    nombre: string;
    rol: RolUsuario;
    creado_en: Date;
}

export interface UsuarioPublico {
    id: number;
    username: string;
    nombre: string;
    rol: RolUsuario;
}
