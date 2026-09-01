import { pool } from '../config/db';
import { Usuario } from '../models/usuario.model';

export const usuarioRepository = {
    async buscarPorUsername(username: string): Promise<Usuario | null> {
        const resultado = await pool.query<Usuario>(
            'SELECT * FROM usuarios WHERE username = $1 LIMIT 1',
            [username]
        );
        return resultado.rows[0] ?? null;
    },

    async buscarPorId(id: number): Promise<Usuario | null> {
        const resultado = await pool.query<Usuario>(
            'SELECT * FROM usuarios WHERE id = $1 LIMIT 1',
            [id]
        );
        return resultado.rows[0] ?? null;
    },
};
