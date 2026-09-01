import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export function manejadorErrores(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (error instanceof ApiError) {
        res.status(error.status).json({
            mensaje: error.message,
            ...(error.codigo ? { codigo: error.codigo } : {}),
        });
        return;
    }

    console.error('Error no controlado:', error);
    res.status(500).json({ mensaje: 'Ocurrió un error interno en el servidor.' });
}

export function rutaNoEncontrada(_req: Request, res: Response): void {
    res.status(404).json({ mensaje: 'El recurso solicitado no existe.' });
}
