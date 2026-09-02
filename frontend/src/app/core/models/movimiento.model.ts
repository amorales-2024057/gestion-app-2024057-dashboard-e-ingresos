export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface MovimientoPublico {
    id: number;
    tipo: TipoMovimiento;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

export interface CrearMovimientoRequest {
    tipo: TipoMovimiento;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

// Fila que se muestra en la "Vista Previa del Registro" mientras el
// usuario todavia no ha dado clic en "Confirmar y guardar registro".
// Lleva un id local (temporal, solo del navegador) para poder
// identificarla en la lista y poder quitarla antes de guardar.
export interface MovimientoEnVistaPrevia extends CrearMovimientoRequest {
    idLocal: string;
}

// Catalogo de categorias de ingreso que ofrece el select del formulario,
// junto con la etiqueta que se muestra en pantalla.
export interface CategoriaIngreso {
    valor: string;
    etiqueta: string;
}

export const CATEGORIAS_INGRESO: CategoriaIngreso[] = [
    { valor: 'SALARIO', etiqueta: 'Salario' },
    { valor: 'VENTA', etiqueta: 'Venta' },
    { valor: 'REGALO', etiqueta: 'Regalo' },
    { valor: 'BONO', etiqueta: 'Bono / Aguinaldo' },
    { valor: 'REEMBOLSO', etiqueta: 'Reembolso' },
    { valor: 'PENSION', etiqueta: 'Pensión' },
    { valor: 'RENTA', etiqueta: 'Renta' },
    { valor: 'PRESTAMO', etiqueta: 'Préstamo recibido' },
    { valor: 'INVERSION', etiqueta: 'Inversión' },
    { valor: 'OTRO', etiqueta: 'Otro' },
];