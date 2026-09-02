import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import movimientoRoutes from './movimiento.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/movimientos', movimientoRoutes);

export default router;
