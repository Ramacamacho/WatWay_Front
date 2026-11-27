import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Aviso, NuevoAviso } from '../Models/aviso';

@Injectable({ providedIn: 'root' })
export class AvisoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080';

  // GET /avisos/activos -> los que ven todos los usuarios
  getActivos() {
    return this.http.get<Aviso[]>(`${this.apiUrl}/avisos/activos`);
  }

  // ---------- Solo admin ----------

  getTodos() {
    return this.http.get<Aviso[]>(`${this.apiUrl}/admin/avisos`);
  }

  crear(aviso: NuevoAviso) {
    return this.http.post<Aviso>(`${this.apiUrl}/admin/avisos`, aviso);
  }

  editar(id: number, aviso: NuevoAviso) {
    return this.http.put<Aviso>(`${this.apiUrl}/admin/avisos/${id}`, aviso);
  }

  cambiarActivo(id: number, activo: boolean) {
    return this.http.put<Aviso>(`${this.apiUrl}/admin/avisos/${id}/activo`, { activo });
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/admin/avisos/${id}`);
  }
}
