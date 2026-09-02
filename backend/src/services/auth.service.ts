import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuario.repository';
import { LoginRequest, LoginResponse, JwtPayload, RegistroRequest } from '../models/auth.model';
import { GeneroUsuario, Usuario, UsuarioPublico } from '../models/usuario.model';
import { ApiError } from '../utils/api-error';
import { env } from '../config/env';

const GENEROS_VALIDOS: GeneroUsuario[] = [
    'MASCULINO',
    'FEMENINO',
    'OTRO',
    'PREFIERO_NO_DECIRLO',
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USERNAME = /^[a-zA-Z0-9._-]+$/;

function validarDatosRegistro(datos: RegistroRequest): void {
    if (!datos.nombre?.trim()) {
        throw new ApiError(400, 'Por favor, indique su nombre.');
    }

    if (!datos.apellido?.trim()) {
        throw new ApiError(400, 'Por favor, indique su apellido.');
    }

    if (!datos.email?.trim() || !REGEX_EMAIL.test(datos.email.trim())) {
        throw new ApiError(400, 'Ingrese un correo electrónico válido.');
    }

    if (!datos.genero || !GENEROS_VALIDOS.includes(datos.genero)) {
        throw new ApiError(400, 'Seleccione un género válido.');
    }

    const username = datos.username?.trim() ?? '';
    if (username.length < 3 || username.length > 50) {
        throw new ApiError(400, 'El nombre de usuario debe tener entre 3 y 50 caracteres.');
    }
    if (!REGEX_USERNAME.test(username)) {
        throw new ApiError(
            400,
            'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.'
        );
    }

    if (!datos.password || datos.password.length < 8) {
        throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres.');
    }
}

export function aUsuarioPublico(usuario: Usuario): UsuarioPublico {
    return {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        genero: usuario.genero,
        rol: usuario.rol,
        telefono: usuario.telefono,
        avatarUrl: usuario.avatar_url,
    };
}

export const authService = {
    async login({ username, password }: LoginRequest): Promise<LoginResponse> {
        if (!username || !password) {
            throw new ApiError(400, 'El usuario y la contraseña son obligatorios.');
        }

        const usuario = await usuarioRepository.buscarPorUsername(username);
        if (!usuario) {
            throw new ApiError(401, 'Credenciales inválidas.');
        }

        if (!usuario.activo) {
            throw new ApiError(403, 'Esta cuenta se encuentra deshabilitada.');
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            throw new ApiError(401, 'Credenciales inválidas.');
        }

        const payload: JwtPayload = {
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol,
        };

        const token = jwt.sign(payload, env.jwtSecret, {
            expiresIn: env.jwtExpiresIn,
        } as jwt.SignOptions);

        return {
            token,
            usuario: aUsuarioPublico(usuario),
        };
    },

    // Alta de cuenta desde el boton "Crear cuenta" del login. Si todo
    // sale bien, deja al usuario con la sesion ya iniciada (mismo
    // formato de respuesta que login), para no obligarlo a escribir sus
    // credenciales dos veces seguidas.
    async registrar(datos: RegistroRequest): Promise<LoginResponse> {
        validarDatosRegistro(datos);

        const username = datos.username.trim();
        const email = datos.email.trim().toLowerCase();

        if (await usuarioRepository.existeUsername(username)) {
            throw new ApiError(409, 'Ese nombre de usuario ya está en uso. Elija otro, por favor.');
        }

        if (await usuarioRepository.existeEmail(email)) {
            throw new ApiError(409, 'Ya existe una cuenta registrada con ese correo electrónico.');
        }

        const passwordHash = await bcrypt.hash(datos.password, 10);

        const usuarioCreado = await usuarioRepository.crear(
            {
                ...datos,
                username,
                email,
                nombre: datos.nombre.trim(),
                apellido: datos.apellido.trim(),
                telefono: datos.telefono?.trim() || null,
            },
            passwordHash
        );

        const payload: JwtPayload = {
            id: usuarioCreado.id,
            username: usuarioCreado.username,
            rol: usuarioCreado.rol,
        };

        const token = jwt.sign(payload, env.jwtSecret, {
            expiresIn: env.jwtExpiresIn,
        } as jwt.SignOptions);

        return {
            token,
            usuario: aUsuarioPublico(usuarioCreado),
        };
    },

    async obtenerPerfil(id: number): Promise<UsuarioPublico> {
        const usuario = await usuarioRepository.buscarPorId(id);
        if (!usuario) {
            throw new ApiError(404, 'Usuario no encontrado.');
        }
        return aUsuarioPublico(usuario);
    },
};
