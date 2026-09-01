import { Response } from 'express';
import { authService } from '../services/auth.service';
import { RequestAutenticado } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/api-error';

export const authController = {
    async login(req: RequestAutenticado, res: Response): Promise<void> {
        const resultado = await authService.login(req.body);
        res.status(200).json(resultado);
    },

    async perfil(req: RequestAutenticado, res: Response): Promise<void> {
        if (!req.usuario) {
            throw new ApiError(401, 'No autenticado.');
        }
        const usuario = await authService.obtenerPerfil(req.usuario.id);
        res.status(200).json(usuario);
    },
};
