import { Component, inject, signal } from '@angular/core';
import { PerfilService } from '../../Servicios/perfil-service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Perfil } from '../../Models/perfil';

@Component({
  imports: [ReactiveFormsModule,RouterLink],
  selector: 'app-perfilpage',
  styleUrl: './perfilpage.css',
  templateUrl: './perfilpage.html',
})
export class Perfilpage {
 private perfilService = inject(PerfilService)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  perfil = signal<Perfil | null>(null)
  cargando = signal(true)
  error = signal('')
  exito = signal('')

  editando = signal(false)
  guardando = signal(false)

  modalAbierto = signal(false)
  confirmacion = signal('')
  eliminando = signal(false)

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

  get puedeEliminar() {
    return this.confirmacion().trim().toLowerCase() === this.perfil()?.email.toLowerCase();
  }

  abrirModal() {
    this.confirmacion.set('');
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

    this.perfilService.eliminarCuenta().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/']);
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar la cuenta. Intentá de nuevo.');
        this.modalAbierto.set(false);
      },
    });
  }
}