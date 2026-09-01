import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse, UsuarioPublico } from '../models/usuario.model';
import { SesionExpiradaService } from './sesion-expirada.service';

const CLAVE_TOKEN = 'finanzas_token';
const CLAVE_USUARIO = 'finanzas_usuario';

interface PayloadToken {
    exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly sesionExpiradaService = inject(SesionExpiradaService);

    private readonly usuarioActual = signal<UsuarioPublico | null>(this.cargarUsuarioGuardado());
    readonly usuario = this.usuarioActual.asReadonly();

    private temporizadorExpiracion: ReturnType<typeof setTimeout> | null = null;

    constructor(private readonly http: HttpClient) {
        const token = this.obtenerToken();
        if (token) {
            this.programarExpiracion(token);
        }
    }

    login(credenciales: LoginRequest): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${API_BASE_URL}/auth/login`, credenciales)
            .pipe(
                tap((respuesta) => {
                    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
                    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
                    this.usuarioActual.set(respuesta.usuario);
                    this.programarExpiracion(respuesta.token);
                })
            );
    }

    logout(): void {
        this.cancelarExpiracionProgramada();
        localStorage.removeItem(CLAVE_TOKEN);
        localStorage.removeItem(CLAVE_USUARIO);
        this.usuarioActual.set(null);
    }

    obtenerToken(): string | null {
        return localStorage.getItem(CLAVE_TOKEN);
    }

    estaAutenticado(): boolean {
        return !!this.obtenerToken();
    }

    private cargarUsuarioGuardado(): UsuarioPublico | null {
        const datosGuardados = localStorage.getItem(CLAVE_USUARIO);
        if (!datosGuardados) {
            return null;
        }

        try {
            return JSON.parse(datosGuardados) as UsuarioPublico;
        } catch {
            return null;
        }
    }

    /**
     * Lee la fecha de expiración (`exp`) directamente del JWT y programa
     * un temporizador para avisarle a la persona apenas el token venza,
     * sin necesidad de esperar a que falle una petición al backend.
     */
    private programarExpiracion(token: string): void {
        this.cancelarExpiracionProgramada();

        const payload = this.decodificarPayload(token);
        if (!payload?.exp) {
            return;
        }

        const expiracionMs = payload.exp * 1000;
        const msRestantes = expiracionMs - Date.now();

        if (msRestantes <= 0) {
            this.expirarSesion();
            return;
        }

        this.temporizadorExpiracion = setTimeout(() => this.expirarSesion(), msRestantes);
    }

    private cancelarExpiracionProgramada(): void {
        if (this.temporizadorExpiracion !== null) {
            clearTimeout(this.temporizadorExpiracion);
            this.temporizadorExpiracion = null;
        }
    }

    private expirarSesion(): void {
        this.logout();
        this.sesionExpiradaService.mostrar();
    }

    private decodificarPayload(token: string): PayloadToken | null {
        try {
            const segmentoPayload = token.split('.')[1];
            const base64 = segmentoPayload.replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(base64);
            return JSON.parse(json) as PayloadToken;
        } catch {
            return null;
        }
    }
}
