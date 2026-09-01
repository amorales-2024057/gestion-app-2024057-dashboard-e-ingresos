import { Injectable, signal } from '@angular/core';

const MENSAJE_POR_DEFECTO = 'Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente.';

@Injectable({ providedIn: 'root' })
export class SesionExpiradaService {
    private readonly visible = signal(false);
    private readonly mensaje = signal(MENSAJE_POR_DEFECTO);

    readonly estaVisible = this.visible.asReadonly();
    readonly mensajeActual = this.mensaje.asReadonly();

    mostrar(mensaje?: string): void {
        this.mensaje.set(mensaje?.trim() ? mensaje : MENSAJE_POR_DEFECTO);
        this.visible.set(true);
    }

    ocultar(): void {
        this.visible.set(false);
    }
}
