import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/error.middleware';

const app: Application = express();

app.use(
    cors({
        origin: env.corsOrigin,
    })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.status(200).json({ estado: 'ok' });
});

app.use('/api', routes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

export default app;
