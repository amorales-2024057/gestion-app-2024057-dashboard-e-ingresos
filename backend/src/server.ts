import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${env.port}`);
});
