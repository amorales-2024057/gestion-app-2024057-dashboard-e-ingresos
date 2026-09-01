import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioRepository } from '../repositories/usuario.repository';
import { LoginRequest, LoginResponse, JwtPayload } from '../models/auth.model';
import { UsuarioPublico } from '../models/usuario.model';
import { ApiError } from '../utils/api-error';
import { env } from '../config/env';

function aUsuarioPublico(usuario: {
    id: number;
    username: string;
    nombre: string;
    rol: 'ADMIN' | 'USER';
}): UsuarioPublico {
    return {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
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

    async obtenerPerfil(id: number): Promise<UsuarioPublico> {
        const usuario = await usuarioRepository.buscarPorId(id);
        if (!usuario) {
            throw new ApiError(404, 'Usuario no encontrado.');
        }
        return aUsuarioPublico(usuario);
    },
};
