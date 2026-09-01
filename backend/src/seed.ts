import bcrypt from 'bcryptjs';
import { pool } from './config/db';

interface UsuarioSemilla {
    username: string;
    password: string;
    nombre: string;
    rol: 'ADMIN' | 'USER';
}

const usuariosSemilla: UsuarioSemilla[] = [
    {
        username: 'admin',
        password: 'Admin123!',
        nombre: 'Administrador',
        rol: 'ADMIN',
    },
    {
        username: 'user',
        password: 'User123!',
        nombre: 'Usuario',
        rol: 'USER',
    },
];

async function ejecutarSeed(): Promise<void> {
    console.log('Iniciando la carga de usuarios base...');

    for (const usuario of usuariosSemilla) {
        const hash = await bcrypt.hash(usuario.password, 10);

        await pool.query(
            `INSERT INTO usuarios (username, password, nombre, rol)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (username) DO UPDATE
             SET password = EXCLUDED.password,
                 nombre = EXCLUDED.nombre,
                 rol = EXCLUDED.rol`,
            [usuario.username, hash, usuario.nombre, usuario.rol]
        );

        console.log(`Usuario listo: ${usuario.username} (${usuario.rol})`);
    }

    console.log('Carga de usuarios finalizada correctamente.');
    await pool.end();
}

ejecutarSeed().catch((error) => {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
});
