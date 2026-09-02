import { pool } from '../config/db';
import { Usuario, ActualizarPerfilRequest } from '../models/usuario.model';
import { RegistroRequest } from '../models/auth.model';

export const usuarioRepository = {
    async existeUsername(username: string): Promise<boolean> {
        const resultado = await pool.query('SELECT 1 FROM usuarios WHERE username = $1 LIMIT 1', [username]);
        return (resultado.rowCount ?? 0) > 0;
    },

    async existeEmail(email: string): Promise<boolean> {
        const resultado = await pool.query('SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1', [email]);
        return (resultado.rowCount ?? 0) > 0;
    },

    // Alta de una cuenta nueva desde el boton "Crear cuenta" del login.
    // El rol siempre queda como 'USER'.
    async crear(datos: RegistroRequest, passwordHash: string): Promise<Usuario> {
        const resultado = await pool.query<Usuario>(
            `INSERT INTO usuarios (username, password, nombre, apellido, email, genero, rol, telefono)
             VALUES ($1, $2, $3, $4, $5, $6, 'USER', $7)
             RETURNING *`,
            [
                datos.username,
                passwordHash,
                datos.nombre,
                datos.apellido,
                datos.email,
                datos.genero,
                datos.telefono ?? null,
            ]
        );
        return resultado.rows[0];
    },

    async buscarPorUsername(username: string): Promise<Usuario | null> {
        const resultado = await pool.query<Usuario>(
            'SELECT * FROM usuarios WHERE username = $1 LIMIT 1',
            [username]
        );
        return resultado.rows[0] ?? null;
    },

    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const resultado = await pool.query<Usuario>(
            'SELECT * FROM usuarios WHERE email = $1 LIMIT 1',
            [email]
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

    // Valida que el username/email no lo tenga ya otro usuario distinto
    // al que se esta editando (para no chocar con la restriccion UNIQUE
    // de la base de datos con un error feo de PostgreSQL).
    async existeUsernameDeOtroUsuario(username: string, idUsuarioActual: number): Promise<boolean> {
        const resultado = await pool.query(
            'SELECT 1 FROM usuarios WHERE username = $1 AND id <> $2 LIMIT 1',
            [username, idUsuarioActual]
        );
        return (resultado.rowCount ?? 0) > 0;
    },

    async existeEmailDeOtroUsuario(email: string, idUsuarioActual: number): Promise<boolean> {
        const resultado = await pool.query(
            'SELECT 1 FROM usuarios WHERE email = $1 AND id <> $2 LIMIT 1',
            [email, idUsuarioActual]
        );
        return (resultado.rowCount ?? 0) > 0;
    },

    async actualizarPerfil(
        id: number,
        datos: ActualizarPerfilRequest,
        passwordHash: string | null
    ): Promise<Usuario> {
        const resultado = await pool.query<Usuario>(
            `UPDATE usuarios
             SET nombre = $1,
                 apellido = $2,
                 email = $3,
                 genero = $4,
                 username = $5,
                 telefono = $6,
                 password = COALESCE($7, password),
                 actualizado_en = NOW()
             WHERE id = $8
             RETURNING *`,
            [
                datos.nombre,
                datos.apellido,
                datos.email,
                datos.genero,
                datos.username,
                datos.telefono ?? null,
                passwordHash,
                id,
            ]
        );
        return resultado.rows[0];
    },
};
