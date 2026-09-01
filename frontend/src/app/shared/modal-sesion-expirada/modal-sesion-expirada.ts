import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionExpiradaService } from '../../core/services/sesion-expirada.service';

@Component({
    selector: 'app-modal-sesion-expirada',
    standalone: true,
    templateUrl: './modal-sesion-expirada.html',
    styleUrl: './modal-sesion-expirada.css',
})
export class ModalSesionExpirada {
    private readonly router = inject(Router);
    protected readonly sesionExpiradaService = inject(SesionExpiradaService);

    protected irAlLogin(): void {
        this.sesionExpiradaService.ocultar();
        this.router.navigate(['/login']);
    }
}
