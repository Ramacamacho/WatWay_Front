import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForoService } from '../../Servicios/foro-service';
import { Respuesta, TemaDetalle } from '../../Models/foro';

import { BotonDenunciar } from '../../Components/boton-denunciar/boton-denunciar';
@Component({
  selector: 'app-foro-tema',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, BotonDenunciar],
  templateUrl: './foro-tema.html',
  styleUrl: './foro-tema.css',
})
export class ForoTema implements OnInit {
  private foroService = inject(ForoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  tema = signal<TemaDetalle | null>(null);
  cargando = signal(true);
  error = signal('');
  guardando = signal(false);

  editandoTema = signal(false);
  confirmandoBorrarTema = signal(false);
  editandoRespuestaId = signal<number | null>(null);
  confirmandoRespuestaId = signal<number | null>(null);

  formTema = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  formRespuesta = this.fb.nonNullable.group({
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  formEditarRespuesta = this.fb.nonNullable.group({
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  // Para el botón "Volver": reabre el estado o la pestaña global
  volverParams = computed(() => {
    const t = this.tema();
    if (!t) return {};
    return t.estadoCodigo ? { estado: t.estadoCodigo } : { vista: 'global' };
  });

  private id = 0;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  // READ
  cargar() {
    this.cargando.set(true);
    this.foroService.getTema(this.id).subscribe({
      next: t => {
        this.tema.set(t);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo cargar el tema.'));
      },
    });
  }

  // ---------- Tema: UPDATE / DELETE ----------

  empezarEdicionTema() {
    const t = this.tema();
    if (!t) return;
    this.formTema.setValue({ titulo: t.titulo, contenido: t.contenido });
    this.editandoTema.set(true);
  }

  guardarTema() {
    if (this.formTema.invalid) {
      this.formTema.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.foroService.editarTema(this.id, this.formTema.getRawValue()).subscribe({
      next: t => {
        this.guardando.set(false);
        this.tema.set(t);
        this.editandoTema.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo editar el tema.'));
      },
    });
  }

  borrarTema() {
    const params = this.volverParams();
    this.foroService.eliminarTema(this.id).subscribe({
      next: () => this.router.navigate(['/foro'], { queryParams: params }),
      error: (err: HttpErrorResponse) => {
        this.confirmandoBorrarTema.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo borrar el tema.'));
      },
    });
  }

  // ---------- Respuestas: CREATE / UPDATE / DELETE ----------

  responder() {
    if (this.formRespuesta.invalid) {
      this.formRespuesta.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.foroService.responder(this.id, this.formRespuesta.getRawValue().contenido).subscribe({
      next: r => {
        this.guardando.set(false);
        this.formRespuesta.reset();
        this.tema.update(t => (t ? { ...t, respuestas: [...t.respuestas, r] } : t));
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo publicar la respuesta.'));
      },
    });
  }

  empezarEdicionRespuesta(r: Respuesta) {
    this.confirmandoRespuestaId.set(null);
    this.formEditarRespuesta.setValue({ contenido: r.contenido });
    this.editandoRespuestaId.set(r.id);
  }

  guardarRespuesta(r: Respuesta) {
    if (this.formEditarRespuesta.invalid) {
      this.formEditarRespuesta.markAllAsTouched();
      return;
    }
    this.foroService.editarRespuesta(r.id, this.formEditarRespuesta.getRawValue().contenido).subscribe({
      next: nueva => {
        this.editandoRespuestaId.set(null);
        this.reemplazarRespuesta(nueva);
      },
      error: (err: HttpErrorResponse) => this.error.set(this.mensajeError(err, 'No se pudo editar la respuesta.')),
    });
  }

  borrarRespuesta(r: Respuesta) {
    this.foroService.eliminarRespuesta(r.id).subscribe({
      next: () => {
        this.confirmandoRespuestaId.set(null);
        this.tema.update(t => (t ? { ...t, respuestas: t.respuestas.filter(x => x.id !== r.id) } : t));
      },
      error: (err: HttpErrorResponse) => this.error.set(this.mensajeError(err, 'No se pudo borrar la respuesta.')),
    });
  }

  private reemplazarRespuesta(nueva: Respuesta) {
    this.tema.update(t =>
      t ? { ...t, respuestas: t.respuestas.map(x => (x.id === nueva.id ? nueva : x)) } : t,
    );
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    return err.error?.error || porDefecto;
  }
}
