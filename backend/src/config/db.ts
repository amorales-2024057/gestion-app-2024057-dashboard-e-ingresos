import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    password: env.db.password,
});

pool.on('error', (error) => {
    console.error('Error inesperado en el pool de PostgreSQL:', error);
});
