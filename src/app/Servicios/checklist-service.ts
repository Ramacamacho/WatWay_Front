import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChecklistResumen } from '../Models/checklist-resumen';
import { ChecklistItem } from '../Models/checklist-item';
import { Documento } from '../Models/documento';

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/checklist';

  obtenerMiResumen(): Observable<ChecklistResumen> {
    return this.http.get<ChecklistResumen>(`${this.apiUrl}/mi-resumen`);
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

  // POST /checklist/items -> agrega un documento a mi checklist
  agregarItem(documento: Documento, fechaLimite: string | null): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(`${this.apiUrl}/items`, {
      documento,
      completado: false,
      fechaLimite,
    });
  }

  // PUT /checklist/items/{id} -> edita fecha límite y estado
  actualizarItem(item: ChecklistItem, fechaLimite: string | null): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.apiUrl}/items/${item.id}`, {
      documento: item.documento,
      completado: item.completado,
      fechaLimite,
    });
  }

  // DELETE /checklist/items/{id}
  eliminarItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`);
  }
}