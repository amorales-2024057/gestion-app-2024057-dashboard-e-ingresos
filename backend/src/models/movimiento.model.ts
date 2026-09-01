// Modelo de la tabla "movimientos" (backend/db/init.sql). Todavia no tiene
// repository/service/controller/rutas -- esos se arman cuando se construya
// el apartado de "Nuevo Registro" en una proxima entrega. Por ahora nada
// mas se deja el tipo listo para cuando toque usarlo.

export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface Movimiento {
    id: number;
    usuario_id: number;
    tipo: TipoMovimiento;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: Date;
    creado_en: Date;
}
