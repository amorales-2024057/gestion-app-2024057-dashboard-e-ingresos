import bcrypt from 'bcryptjs';
import { usuarioRepository } from '../repositories/usuario.repository';
import { ActualizarPerfilRequest, UsuarioPublico, GeneroUsuario } from '../models/usuario.model';
import { aUsuarioPublico } from './auth.service';
import { ApiError } from '../utils/api-error';

const GENEROS_VALIDOS: GeneroUsuario[] = [
    'MASCULINO',
    'FEMENINO',
    'OTRO',
    'PREFIERO_NO_DECIRLO',
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarDatosPerfil(datos: ActualizarPerfilRequest): void {
    if (!datos.nombre?.trim() || !datos.apellido?.trim()) {
        throw new ApiError(400, 'El nombre y el apellido son obligatorios.');
    }

    if (!datos.username?.trim() || datos.username.trim().length < 3) {
        throw new ApiError(400, 'El nombre de usuario debe tener al menos 3 caracteres.');
    }

    if (!datos.email?.trim() || !REGEX_EMAIL.test(datos.email.trim())) {
        throw new ApiError(400, 'El correo electrónico no es válido.');
    }

    if (!GENEROS_VALIDOS.includes(datos.genero)) {
        throw new ApiError(400, 'El género seleccionado no es válido.');
    }

    if (datos.password && datos.password.length < 8) {
        throw new ApiError(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
    }
}

export const usuarioService = {
    // Actualiza nombre, apellido, email, genero, username, telefono y,
    // opcionalmente, la contrasena de un usuario ya autenticado. Este es
    // el endpoint que deja la base de datos de "usuarios" con toda la
    // informacion profesional que pidio el cliente (nombre, apellido,
    // email, contrasena, genero, rol, nombre de usuario, telefono).
    async actualizarPerfil(id: number, datos: ActualizarPerfilRequest): Promise<UsuarioPublico> {
        validarDatosPerfil(datos);

        const usernameLimpio = datos.username.trim();
        const emailLimpio = datos.email.trim().toLowerCase();

        const usernameOcupado = await usuarioRepository.existeUsernameDeOtroUsuario(usernameLimpio, id);
        if (usernameOcupado) {
            throw new ApiError(409, 'Ese nombre de usuario ya está en uso.');
        }

        const emailOcupado = await usuarioRepository.existeEmailDeOtroUsuario(emailLimpio, id);
        if (emailOcupado) {
            throw new ApiError(409, 'Ese correo electrónico ya está en uso.');
        }

        const passwordHash = datos.password ? await bcrypt.hash(datos.password, 10) : null;

        const usuarioActualizado = await usuarioRepository.actualizarPerfil(
            id,
            {
                ...datos,
                username: usernameLimpio,
                email: emailLimpio,
                nombre: datos.nombre.trim(),
                apellido: datos.apellido.trim(),
                telefono: datos.telefono?.trim() || null,
            },
            passwordHash
        );

        return aUsuarioPublico(usuarioActualizado);
    },
};
