import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { ChecklistService } from '../../Servicios/checklist-service';
import { ChecklistResumen } from '../../Models/checklist-resumen';
import { Documento, DOCUMENTO_LABEL } from '../../Models/documento';
import { ChecklistItem } from '../../Models/checklist-item';

@Component({
  imports: [DecimalPipe],
  selector: 'app-checklist-form',
  styleUrl: './checklist-form.css',
  templateUrl: './checklist-form.html',
})
export class ChecklistForm implements OnInit {
  private checklistService = inject(ChecklistService);

  resumen = signal<ChecklistResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  labels = DOCUMENTO_LABEL;

  // Formulario para agregar un documento
  nuevoDocumento = signal<Documento | ''>('');
  nuevaFecha = signal('');
  // Id del item al que se le pide confirmación para quitarlo
  confirmandoId = signal<number | null>(null);

  // Documentos que todavía no están en el checklist (para el select de "agregar")
  disponibles(): Documento[] {
    const r = this.resumen();
    if (!r) return [];
    const usados = new Set([...r.faltantes, ...r.completados].map(i => i.documento));
    return (Object.keys(DOCUMENTO_LABEL) as Documento[]).filter(d => !usados.has(d));
  }

  ngOnInit() {
    this.cargarResumen();
  }

  cargarResumen() {
    this.checklistService.obtenerMiResumen().subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.resumen.set(null);
        this.cargando.set(false);
        this.error.set(
          err.status === 404
            ? 'Todavía no tenés un checklist creado'
            : 'No se pudo cargar el checklist'
        );
      },
    });
  }

  toggle(item: ChecklistItem) {
    this.checklistService.marcarCompletado(item.id, !item.completado).subscribe({
      next: () => this.cargarResumen(),
      error: () => this.error.set('No se pudo actualizar el documento'),
    });
  }

  // ---------- Crear ----------
  agregar() {
    const doc = this.nuevoDocumento();
    if (!doc) return;
    this.checklistService.agregarItem(doc, this.nuevaFecha() || null).subscribe({
      next: () => {
        this.nuevoDocumento.set('');
        this.nuevaFecha.set('');
        this.cargarResumen();
      },
      error: (err: HttpErrorResponse) =>
        this.error.set(err.status === 409 ? 'Ese documento ya está en tu checklist' : 'No se pudo agregar el documento'),
    });
  }

  onNuevoDocumento(event: Event) {
    this.nuevoDocumento.set((event.target as HTMLSelectElement).value as Documento | '');
  }

  onNuevaFecha(event: Event) {
    this.nuevaFecha.set((event.target as HTMLInputElement).value);
  }

  // ---------- Editar fecha límite ----------
  cambiarFecha(item: ChecklistItem, event: Event) {
    const fecha = (event.target as HTMLInputElement).value || null;
    this.checklistService.actualizarItem(item, fecha).subscribe({
      next: () => this.cargarResumen(),
      error: () => this.error.set('No se pudo cambiar la fecha'),
    });
  }

  // ---------- Borrar ----------
  pedirConfirmacion(id: number) {
    this.confirmandoId.set(id);
  }

  cancelarQuitar() {
    this.confirmandoId.set(null);
  }

  quitar(item: ChecklistItem) {
    this.checklistService.eliminarItem(item.id).subscribe({
      next: () => {
        this.confirmandoId.set(null);
        this.cargarResumen();
      },
      error: () => {
        this.confirmandoId.set(null);
        this.error.set('No se pudo quitar el documento');
      },
    });
  }
}