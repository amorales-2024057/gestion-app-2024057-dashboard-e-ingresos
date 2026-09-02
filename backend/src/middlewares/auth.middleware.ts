import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../models/auth.model';
import { ApiError } from '../utils/api-error';

export interface RequestAutenticado extends Request {
    usuario?: JwtPayload;
}

export function verificarToken(
    req: RequestAutenticado,
    _res: Response,
    next: NextFunction
): void {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
        throw new ApiError(401, 'No se proporcionó un token de acceso.', 'TOKEN_AUSENTE');
    }

    const token = encabezado.split(' ')[1];

    try {
        const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
        req.usuario = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(
                401,
                'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.',
                'TOKEN_EXPIRADO'
            );
        }

        throw new ApiError(401, 'El token es inválido.', 'TOKEN_INVALIDO');
    }
}
