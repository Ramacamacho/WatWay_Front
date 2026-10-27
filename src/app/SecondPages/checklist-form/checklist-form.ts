import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChecklistService } from '../../Servicios/checklist-service';
import { ChecklistResumen } from '../../Models/checklist-resumen';
import { DOCUMENTO_LABEL } from '../../Models/documento';
import { ChecklistItem } from '../../Models/checklist-item';

@Component({
  imports: [DatePipe, DecimalPipe],
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
}