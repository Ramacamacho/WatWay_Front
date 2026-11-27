import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DecisionDenuncia, Denuncia, EstadoDenuncia, NuevaDenuncia } from '../Models/denuncia';

@Injectable({ providedIn: 'root' })
export class DenunciaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080';

  // POST /denuncias
  denunciar(denuncia: NuevaDenuncia) {
    return this.http.post<Denuncia>(`${this.apiUrl}/denuncias`, denuncia);
  }

  // GET /denuncias/mias
  misDenuncias() {
    return this.http.get<Denuncia[]>(`${this.apiUrl}/denuncias/mias`);
  }

  // ---------- Solo admin ----------

  // GET /admin/denuncias?estado=PENDIENTE (sin estado = todas)
  listar(estado: EstadoDenuncia | null) {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Denuncia[]>(`${this.apiUrl}/admin/denuncias`, { params });
  }

  pendientes() {
    return this.http.get<{ pendientes: number }>(`${this.apiUrl}/admin/denuncias/pendientes`);
  }

  revisar(id: number) {
    return this.http.put<Denuncia>(`${this.apiUrl}/admin/denuncias/${id}/revisar`, {});
  }

  resolver(id: number, decision: DecisionDenuncia) {
    return this.http.put<Denuncia>(`${this.apiUrl}/admin/denuncias/${id}/resolver`, decision);
  }

  descartar(id: number, nota: string) {
    return this.http.put<Denuncia>(`${this.apiUrl}/admin/denuncias/${id}/descartar`, { nota });
  }
}
