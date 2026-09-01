import { Injectable } from '@angular/core';
import { ResumenFinanciero } from '../models/resumen-financiero.model';
import { PuntoGrafica } from '../../shared/graficas/graficas.util';

// Todavía no existe el apartado de Registro, entonces en la base de datos
// no hay nada más que usuario y admin — la tabla "movimientos" ya existe
// (ver backend/db/init.sql) pero está vacía, no hay ingresos ni egresos
// guardados todavía. Por eso este servicio regresa el resumen en cero,
// que es lo que le corresponde mostrar al dashboard ahorita.
//
// Cuando el apartado de Registro ya esté guardando datos reales, aquí es
// donde se cambia RESUMEN_VACIO por una llamada real con HttpClient (por
// ejemplo GET /api/dashboard/resumen). El resto del dashboard
// (dashboard.ts, dashboard.html) no necesita tocarse porque ya consume
// este servicio y no datos fijos.

// Las dos gráficas del maquetado necesitan sus ejes (años / meses) para
// dibujar la cuadrícula aunque no haya ni un solo registro guardado. Por
// eso se arman con value: 0 en vez de dejar el arreglo vacío: así la
// gráfica se ve igual que en el maquetado (ejes, cuadrícula, etiquetas)
// nada más que "aplanada" en cero, en vez de mostrar una caja vacía.
function ultimosAnios(cantidad: number): PuntoGrafica[] {
    const anioActual = new Date().getFullYear();
    const anios: PuntoGrafica[] = [];
    for (let i = cantidad - 1; i >= 0; i--) {
        anios.push({ label: String(anioActual - i), value: 0 });
    }
    return anios;
}

function mesesDelAnioActual(): PuntoGrafica[] {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return nombresMeses.map((nombre) => ({ label: nombre, value: 0 }));
}

const RESUMEN_VACIO: ResumenFinanciero = {
    tarjetas: [
        { etiqueta: 'Total de Ingresos', valor: 'Q0', delta: 'Sin registros todavía', icono: 'billete', destacada: true },
        { etiqueta: 'Total de egresos', valor: 'Q0', delta: 'Sin registros todavía', icono: 'persona' },
        { etiqueta: 'Balance total', valor: 'Q0', delta: 'Sin registros todavía', icono: 'flecha', acento: true },
        { etiqueta: 'Porcentaje de balance mensual', valor: '0%', delta: 'Sin registros todavía', icono: 'grafico' },
    ],
    balanceAnual: ultimosAnios(7),
    balanceMensual: mesesDelAnioActual(),
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
    obtenerResumen(): ResumenFinanciero {
        return RESUMEN_VACIO;
    }
}