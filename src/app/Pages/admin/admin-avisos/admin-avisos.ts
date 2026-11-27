import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AvisoService } from '../../../Servicios/aviso-service';
import { Aviso } from '../../../Models/aviso';

// Sección del panel de admin para publicar y manejar los avisos generales
@Component({
  selector: 'app-admin-avisos',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './admin-avisos.html',
  styleUrl: './admin-avisos.css',
})
export class AdminAvisos implements OnInit {
  private avisoService = inject(AvisoService);
  private fb = inject(FormBuilder);

  avisos = signal<Aviso[]>([]);
  error = signal('');
  exito = signal('');
  guardando = signal(false);
  // null = creando uno nuevo; un id = editando ese aviso
  editandoId = signal<number | null>(null);
  borrandoId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    mensaje: ['', [Validators.required, Validators.maxLength(500)]],
    importante: [false],
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.avisoService.getTodos().subscribe({
      next: (lista) => this.avisos.set(lista),
      error: (err: HttpErrorResponse) => this.error.set(this.mensajeError(err, 'No se pudieron cargar los avisos.')),
    });
  }

  guardar() {
    const { titulo, mensaje, importante } = this.form.getRawValue();
    if (this.form.invalid || !titulo.trim() || !mensaje.trim()) {
      this.form.markAllAsTouched();
      return;
    }
    this.limpiar();
    this.guardando.set(true);
    const datos = { titulo: titulo.trim(), mensaje: mensaje.trim(), importante };
    const id = this.editandoId();
    const peticion = id === null ? this.avisoService.crear(datos) : this.avisoService.editar(id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(id === null ? 'Aviso publicado: ya les aparece a todos.' : 'Aviso actualizado.');
        this.cancelarEdicion();
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo guardar el aviso.'));
      },
    });
  }

  editar(a: Aviso) {
    this.limpiar();
    this.editandoId.set(a.id);
    this.form.setValue({ titulo: a.titulo, mensaje: a.mensaje, importante: a.importante });
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.form.reset({ titulo: '', mensaje: '', importante: false });
  }

  alternarActivo(a: Aviso) {
    this.limpiar();
    this.avisoService.cambiarActivo(a.id, !a.activo).subscribe({
      next: (act) => this.avisos.update((lista) => lista.map((x) => (x.id === act.id ? act : x))),
      error: (err: HttpErrorResponse) => this.error.set(this.mensajeError(err, 'No se pudo cambiar el aviso.')),
    });
  }

  borrar(a: Aviso) {
    this.limpiar();
    this.avisoService.eliminar(a.id).subscribe({
      next: () => {
        this.borrandoId.set(null);
        this.avisos.update((lista) => lista.filter((x) => x.id !== a.id));
        if (this.editandoId() === a.id) this.cancelarEdicion();
      },
      error: (err: HttpErrorResponse) => {
        this.borrandoId.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo borrar el aviso.'));
      },
    });
  }

  private limpiar() {
    this.error.set('');
    this.exito.set('');
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string) {
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    if (err.status === 403) return 'No tenés permisos de administrador.';
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 400 && err.error?.error) return err.error.error;
    return porDefecto;
  }
}
