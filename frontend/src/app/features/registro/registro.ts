import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface OpcionGenero {
    valor: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO_NO_DECIRLO';
    etiqueta: string;
}

// Valida que "confirmarPassword" sea igual a "password". Se coloca a
// nivel de formulario (no de un solo control) porque necesita comparar
// dos campos entre si.
function contrasenasCoincidenValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmar = control.get('confirmarPassword')?.value;

    if (!password || !confirmar) {
        return null;
    }

    return password === confirmar ? null : { contrasenasNoCoinciden: true };
}

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './registro.html',
    styleUrl: './registro.css',
})
export class Registro {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly generos: OpcionGenero[] = [
        { valor: 'FEMENINO', etiqueta: 'Femenino' },
        { valor: 'MASCULINO', etiqueta: 'Masculino' },
        { valor: 'OTRO', etiqueta: 'Otro' },
        { valor: 'PREFIERO_NO_DECIRLO', etiqueta: 'Prefiero no decirlo' },
    ];

    protected readonly cargando = signal(false);
    protected readonly mensajeError = signal<string | null>(null);
    protected readonly mostrarPassword = signal(false);
    protected readonly mostrarConfirmarPassword = signal(false);

    protected readonly formulario = this.fb.group(
        {
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            apellido: ['', [Validators.required, Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            genero: ['', [Validators.required]],
            username: [
                '',
                [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
            ],
            telefono: [''],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmarPassword: ['', [Validators.required]],
        },
        { validators: contrasenasCoincidenValidator }
    );

    protected alternarPassword(): void {
        this.mostrarPassword.update((valor) => !valor);
    }

    protected alternarConfirmarPassword(): void {
        this.mostrarConfirmarPassword.update((valor) => !valor);
    }

    protected enviar(): void {
        if (this.formulario.invalid || this.cargando()) {
            this.formulario.markAllAsTouched();
            return;
        }

        this.cargando.set(true);
        this.mensajeError.set(null);

        const { confirmarPassword, telefono, ...datos } = this.formulario.getRawValue();

        this.authService
            .registrar({
                nombre: datos.nombre ?? '',
                apellido: datos.apellido ?? '',
                email: datos.email ?? '',
                genero: (datos.genero ?? 'PREFIERO_NO_DECIRLO') as OpcionGenero['valor'],
                username: datos.username ?? '',
                password: datos.password ?? '',
                telefono: telefono?.trim() ? telefono.trim() : null,
            })
            .subscribe({
                next: () => {
                    this.cargando.set(false);
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    this.cargando.set(false);
                    this.mensajeError.set(
                        error?.error?.mensaje ??
                            'No se pudo crear su cuenta en este momento. Por favor, intente de nuevo.'
                    );
                },
            });
    }
}
