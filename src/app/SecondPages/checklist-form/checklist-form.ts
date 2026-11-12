import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class ChecklistForm implements OnInit, OnDestroy {
  private checklistService = inject(ChecklistService);

  resumen = signal<ChecklistResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  celebrando = signal(false);

  labels = DOCUMENTO_LABEL;

  confeti = Array.from({ length: 200 }, (_, i) => i + 1);

  private timerCelebracion?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.cargarResumen();
  }

  ngOnDestroy() {
    clearTimeout(this.timerCelebracion);
  }

  cargarResumen() {
    this.checklistService.obtenerMiResumen().subscribe({
      next: (data) => {
        const anterior = this.resumen()?.progreso;

        // Celebra solo si ya había un resumen con menos de 100% y ahora llegó a 100%
        if (anterior !== undefined && anterior < 100 && data.progreso >= 100) {
          this.celebrar();
        } else if (data.progreso < 100) {
          this.celebrando.set(false);
        }

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

  private celebrar() {
    clearTimeout(this.timerCelebracion);
    this.celebrando.set(true);
    this.timerCelebracion = setTimeout(() => this.celebrando.set(false), 3500);
  }
}