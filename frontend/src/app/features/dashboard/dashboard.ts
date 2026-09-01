import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { TarjetaResumen } from '../../core/models/resumen-financiero.model';
import { construirSvgBarras, construirSvgLinea } from '../../shared/graficas/graficas.util';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class Dashboard {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly dashboardService = inject(DashboardService);

    protected readonly usuario = this.authService.usuario;
    protected readonly anioActual = new Date().getFullYear();

    private readonly resumen = this.dashboardService.obtenerResumen();

    protected readonly tarjetas: TarjetaResumen[] = this.resumen.tarjetas;

    // Si no hay puntos todavía (base de datos vacía de registros), no se
    // dibuja ningún SVG y el template muestra el mensaje de "sin datos".
    protected readonly svgLinea: SafeHtml | null =
        this.resumen.balanceAnual.length > 0
            ? this.sanitizer.bypassSecurityTrustHtml(construirSvgLinea(this.resumen.balanceAnual))
            : null;

    protected readonly svgBarras: SafeHtml | null =
        this.resumen.balanceMensual.length > 0
            ? this.sanitizer.bypassSecurityTrustHtml(construirSvgBarras(this.resumen.balanceMensual))
            : null;

    protected cerrarSesion(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}