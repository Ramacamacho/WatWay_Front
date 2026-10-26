// services/checklist.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Checklist, NuevoChecklist } from '../Models/checklist';
import { ChecklistResumen } from '../Models/checklist-resumen';
import { ChecklistItem } from '../Models/checklist-item';


@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/checklist';

  crear(checklist: NuevoChecklist): Observable<Checklist> {
    return this.http.post<Checklist>(this.apiUrl, checklist);
  }

  obtenerResumen(checklistId: number): Observable<ChecklistResumen> {
    return this.http.get<ChecklistResumen>(`${this.apiUrl}/${checklistId}/resumen`);
  }

  marcarCompletado(itemId: number, completado: boolean): Observable<ChecklistItem> {
    return this.http.patch<ChecklistItem>(
      `${this.apiUrl}/items/${itemId}/completado`,
      null,
      { params: { completado } }
    );
  }
}