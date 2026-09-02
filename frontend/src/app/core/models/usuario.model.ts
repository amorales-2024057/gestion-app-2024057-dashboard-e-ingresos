export type RolUsuario = 'ADMIN' | 'USER';

export type GeneroUsuario = 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO_NO_DECIRLO';

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

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: UsuarioPublico;
}

// Datos que se pueden actualizar desde la pantalla de perfil. La
// contrasena es opcional: si se deja vacia, el backend conserva la
// actual.
export interface ActualizarPerfilRequest {
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    username: string;
    telefono?: string | null;
    password?: string;
}

// Datos del formulario "Crear cuenta" del login. El rol siempre lo
// asigna el backend como 'USER'.
export interface RegistroRequest {
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    username: string;
    password: string;
    telefono?: string | null;
}
