import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.put('/perfil', verificarToken, usuarioController.actualizarPerfil);

export default router;
