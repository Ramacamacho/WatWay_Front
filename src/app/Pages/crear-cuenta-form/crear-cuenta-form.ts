import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../Servicios/auth';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest } from '../../Models/register-request';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-crear-cuenta-form',
  styleUrl: './crear-cuenta-form.css',
  templateUrl: './crear-cuenta-form.html',
})
export class CrearCuentaForm {  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  error = signal('');
  cargando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    posicionLaboral: ['', Validators.required],
    ciudadDestino: ['', Validators.required],
    sexo: ['', Validators.required],
    descripcion: ['', Validators.maxLength(500)],
  });

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue() as RegisterRequest).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err: HttpErrorResponse) => {
      this.error.set(err.error?.message || 'No se pudo crear el usuario');
      this.cargando.set(false);
    },
    });
  }

  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.touched && c.invalid;
  }
}
