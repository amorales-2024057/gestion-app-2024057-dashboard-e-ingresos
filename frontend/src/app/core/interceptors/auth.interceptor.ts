import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SesionExpiradaService } from '../services/sesion-expirada.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const sesionExpiradaService = inject(SesionExpiradaService);
    const token = authService.obtenerToken();

    const solicitud = token
        ? req.clone({
              setHeaders: {
                  Authorization: `Bearer ${token}`,
              },
          })
        : req;

    return next(solicitud).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                const codigo = error.error?.codigo;

                if (codigo === 'TOKEN_EXPIRADO') {
                    authService.logout();
                    sesionExpiradaService.mostrar(error.error?.mensaje);
                }
            }

            return throwError(() => error);
        })
    );
};
