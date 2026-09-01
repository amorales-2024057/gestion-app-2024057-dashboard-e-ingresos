CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('ADMIN', 'USER')),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla para el apartado de "Nuevo Registro" (todavia no tiene su
-- controller/service/rutas, esta entrega es solo la base de datos para
-- que el dashboard tenga de donde justificar sus totales en Q0). Un
-- "movimiento" es un ingreso o un egreso, tal cual el toggle del
-- maquetado de "Agregar Transaccion".
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    descripcion VARCHAR(150) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    categoria VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_usuario_id ON movimientos (usuario_id);
