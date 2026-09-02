export type RolUsuario = 'ADMIN' | 'USER';

export type GeneroUsuario = 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO_NO_DECIRLO';

export interface Usuario {
    id: number;
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    rol: RolUsuario;
    telefono: string | null;
    avatar_url: string | null;
    activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
}

// Lo unico que el backend expone hacia el frontend: nunca se manda el
// hash de la contrasena fuera de este archivo.
export interface UsuarioPublico {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    rol: RolUsuario;
    telefono: string | null;
    avatarUrl: string | null;
}

// Datos que se pueden actualizar desde "Editar perfil". La contrasena es
// opcional: si no se manda, se conserva la que ya tenia el usuario.
export interface ActualizarPerfilRequest {
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    username: string;
    telefono?: string | null;
    password?: string;
}
