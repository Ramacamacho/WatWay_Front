import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PerfilService } from '../../Servicios/perfil-service';
import { Auth } from '../../Servicios/auth';
import { Perfil } from '../../Models/perfil';
import { CIUDADES, POSICIONES } from '../../Models/opciones';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-perfilpage',
  styleUrl: './perfilpage.css',
  templateUrl: './perfilpage.html',
})
export class Perfilpage implements OnInit {
  private perfilService = inject(PerfilService);
  private auth = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  perfil = signal<Perfil | null>(null);
  cargando = signal(true);
  error = signal('');
  exito = signal('');

  editando = signal(false);
  guardando = signal(false);

  modalAbierto = signal(false);
  confirmacion = signal('');
  eliminando = signal(false);
  errorModal = signal('');

  // Cambiar contraseña
  cambiandoPassword = signal(false);
  guardandoPassword = signal(false);
  errorPassword = signal('');

  posiciones = POSICIONES;
  ciudades = CIUDADES;

  etiquetaSexo: Record<string, string> = {
    MASCULINO: 'Masculino',
    FEMENINO: 'Femenino',
    OTRO: 'Otro',
  };
  opcionesSexo = Object.keys(this.etiquetaSexo);

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(60)]],
    apellido: ['', [Validators.required, Validators.maxLength(60)]],
    posicionLaboral: ['', [Validators.required, Validators.maxLength(100)]],
    ciudadDestino: ['', [Validators.required, Validators.maxLength(100)]],
    sexo: ['', Validators.required],
    descripcion: ['', Validators.maxLength(500)],
  });

  // Valida que "nueva" y "repetir" sean iguales
  private coincidenPasswords = (grupo: AbstractControl): ValidationErrors | null =>
    grupo.get('nueva')?.value === grupo.get('repetir')?.value ? null : { noCoinciden: true };

  passForm = this.fb.nonNullable.group(
    {
      actual: ['', Validators.required],
      nueva: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      repetir: ['', Validators.required],
    },
    { validators: this.coincidenPasswords },
  );

  ngOnInit() {
    this.perfilService.getPerfil().subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tu perfil.');
        this.cargando.set(false);
      },
    });
  }

  editar() {
    const p = this.perfil();
    if (!p) return;
    this.form.reset({
      nombre: p.nombre,
      apellido: p.apellido,
      posicionLaboral: p.posicionLaboral,
      ciudadDestino: p.ciudadDestino,
      sexo: p.sexo,
      descripcion: p.descripcion ?? '',
    });
    this.error.set('');
    this.exito.set('');
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    this.perfilService.actualizarPerfil(this.form.getRawValue()).subscribe({
      next: (actualizado) => {
        this.perfil.set(actualizado);
        this.guardando.set(false);
        this.editando.set(false);
        this.exito.set('Perfil actualizado correctamente.');
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudieron guardar los cambios. Intentá de nuevo.');
      },
    });
  }

  invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  // ---------- Cambiar contraseña ----------
  abrirCambioPassword() {
    this.passForm.reset();
    this.errorPassword.set('');
    this.exito.set('');
    this.cambiandoPassword.set(true);
  }

  cancelarCambioPassword() {
    this.cambiandoPassword.set(false);
  }

  guardarPassword() {
    if (this.passForm.invalid) {
      this.passForm.markAllAsTouched();
      return;
    }
    this.guardandoPassword.set(true);
    this.errorPassword.set('');
    const { actual, nueva } = this.passForm.getRawValue();

    this.perfilService.cambiarPassword(actual, nueva).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.cambiandoPassword.set(false);
        this.exito.set('Contraseña cambiada correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoPassword.set(false);
        this.errorPassword.set(err.error?.error ?? 'No se pudo cambiar la contraseña.');
      },
    });
  }

  invalidoPass(campo: string) {
    const c = this.passForm.get(campo);
    return !!c && c.invalid && c.touched;
  }

  get noCoinciden() {
    return this.passForm.hasError('noCoinciden') && !!this.passForm.get('repetir')?.touched;
  }

  // ---------- Eliminar cuenta ----------
  // Para borrar la cuenta hay que escribir la contraseña
  get puedeEliminar() {
    return this.confirmacion().length > 0;
  }

  abrirModal() {
    this.confirmacion.set('');
    this.errorModal.set('');
    this.modalAbierto.set(true);
  }

  onConfirmacion(event: Event) {
    this.confirmacion.set((event.target as HTMLInputElement).value);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  eliminar() {
    if (!this.puedeEliminar) return;
    this.eliminando.set(true);
    this.errorModal.set('');

    this.perfilService.eliminarCuenta(this.confirmacion()).subscribe({
      next: () => {
        this.auth.limpiarSesion();
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        // Si la contraseña está mal, el modal queda abierto para reintentar
        this.eliminando.set(false);
        this.errorModal.set(err.error?.error ?? 'No se pudo eliminar la cuenta. Intentá de nuevo.');
      },
    });
  }
}
