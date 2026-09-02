import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovimientoService } from './movimiento.service';
import { ResumenFinanciero } from '../models/resumen-financiero.model';

// El dashboard ya no muestra datos fijos en Q0: ahora consulta el
// resumen real que arma el backend a partir de la tabla "movimientos"
// (GET /api/movimientos/resumen). Ese endpoint ya deja las 4 tarjetas y
// las dos series de las graficas listas para renderizar, incluyendo el
// caso de "todavia no hay registros" (todo en cero, con los ejes ya
// armados). Por eso este servicio es un simple wrapper: mantiene el
// mismo contrato (obtenerResumen) que ya consumia dashboard.ts, pero
// ahora regresando un Observable en vez de un valor fijo.
@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly movimientoService = inject(MovimientoService);

    obtenerResumen(): Observable<ResumenFinanciero> {
        return this.movimientoService.obtenerResumen();
    }
}
