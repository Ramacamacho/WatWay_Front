import { Component, inject, OnInit, signal } from '@angular/core';
import { ChecklistService } from '../../Servicios/checklist-service';
import { ActivatedRoute } from '@angular/router';
import { ChecklistResumen } from '../../Models/checklist-resumen';
import { DOCUMENTO_LABEL } from '../../Models/documento';
import { ChecklistItem } from '../../Models/checklist-item';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [DatePipe ,DecimalPipe],
  selector: 'app-checklist-form',
  styleUrl: './checklist-form.css',
  templateUrl: './checklist-form.html',
})
export class ChecklistForm implements OnInit{
  private checklistService = inject(ChecklistService);
  private route = inject(ActivatedRoute);

  checklistId = 0;
  resumen = signal<ChecklistResumen | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  labels = DOCUMENTO_LABEL;

  ngOnInit() {
    this.checklistId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarResumen();
  }

  cargarResumen() {
    this.checklistService.obtenerResumen(this.checklistId).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.cargando.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cargar el checklist');
        this.cargando.set(false);
      },
    });
  }

  toggle(item: ChecklistItem) {
    this.checklistService.marcarCompletado(item.id, !item.completado).subscribe({
      next: () => this.cargarResumen(),
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo actualizar el documento');
      },
    });
  }
}
