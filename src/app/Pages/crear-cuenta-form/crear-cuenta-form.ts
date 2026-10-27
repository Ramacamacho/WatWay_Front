import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../Servicios/auth';
import { RegisterRequest } from '../../Models/register-request';

// Campos que se validan en cada paso
const CAMPOS_POR_PASO: string[][] = [
  ['email', 'password'],
  ['nombre', 'apellido', 'sexo'],
  ['posicionLaboral', 'ciudadDestino', 'descripcion'],
];

const TITULOS = ['Tu cuenta', 'Sobre vos', 'Work & Travel'];

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-crear-cuenta-form',
  styleUrl: './crear-cuenta-form.css',
  templateUrl: './crear-cuenta-form.html',
})
export class CrearCuentaForm {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  titulos = TITULOS;
  ultimoPaso = CAMPOS_POR_PASO.length - 1;

  paso = signal(0);
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

  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.touched && c.invalid;
  }

  // Marca los campos del paso actual y dice si están todos bien
  private pasoValido(): boolean {
    const campos = CAMPOS_POR_PASO[this.paso()];
    campos.forEach(c => this.form.get(c)?.markAsTouched());
    return campos.every(c => this.form.get(c)?.valid);
  }

  siguiente() {
    this.error.set('');
    if (!this.pasoValido()) return;
    if (this.paso() < this.ultimoPaso) {
      this.paso.update(p => p + 1);
    }
  }

  atras() {
    this.error.set('');
    if (this.paso() > 0) {
      this.paso.update(p => p - 1);
    }
  }

  // Enter en los primeros pasos avanza; en el último envía
  enviar() {
    if (this.paso() < this.ultimoPaso) {
      this.siguiente();
      return;
    }
    if (!this.pasoValido()) return;

    this.cargando.set(true);
    this.error.set('');

    this.auth.registrar(this.form.getRawValue() as RegisterRequest).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor');
        } else if (err.status === 409) {
          // Email repetido: volvemos al paso donde se corrige
          this.paso.set(0);
          this.error.set('Ese email ya está registrado');
        } else {
          this.error.set(err.error?.message || 'No se pudo crear el usuario');
        }
        this.cargando.set(false);
      },
    });
  }
}