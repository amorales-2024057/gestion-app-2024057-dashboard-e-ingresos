import bcrypt from 'bcryptjs';
import { pool } from './config/db';
import { GeneroUsuario, RolUsuario } from './models/usuario.model';

interface UsuarioSemilla {
    username: string;
    password: string;
    nombre: string;
    apellido: string;
    email: string;
    genero: GeneroUsuario;
    rol: RolUsuario;
    telefono: string | null;
}

const usuariosSemilla: UsuarioSemilla[] = [
    {
        username: 'admin',
        password: 'Admin123!',
        nombre: 'Administrador',
        apellido: 'Code-Pulse',
        email: 'admin@codepulse.app',
        genero: 'PREFIERO_NO_DECIRLO',
        rol: 'ADMIN',
        telefono: null,
    },
    {
        username: 'user',
        password: 'User123!',
        nombre: 'Usuario',
        apellido: 'Demo',
        email: 'usuario@codepulse.app',
        genero: 'PREFIERO_NO_DECIRLO',
        rol: 'USER',
        telefono: null,
    },
];

async function ejecutarSeed(): Promise<void> {
    console.log('Iniciando la carga de usuarios base...');

    for (const usuario of usuariosSemilla) {
        const hash = await bcrypt.hash(usuario.password, 10);

        await pool.query(
            `INSERT INTO usuarios (username, password, nombre, apellido, email, genero, rol, telefono)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (username) DO UPDATE
             SET password = EXCLUDED.password,
                 nombre = EXCLUDED.nombre,
                 apellido = EXCLUDED.apellido,
                 email = EXCLUDED.email,
                 genero = EXCLUDED.genero,
                 rol = EXCLUDED.rol,
                 telefono = EXCLUDED.telefono,
                 actualizado_en = NOW()`,
            [
                usuario.username,
                hash,
                usuario.nombre,
                usuario.apellido,
                usuario.email,
                usuario.genero,
                usuario.rol,
                usuario.telefono,
            ]
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
