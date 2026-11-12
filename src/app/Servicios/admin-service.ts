import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AdminUsuario } from '../Models/admin-usuario';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/admin';

  // GET /admin/usuarios
  listarUsuarios() {
    return this.http.get<AdminUsuario[]>(`${this.apiUrl}/usuarios`);
  }

  // DELETE /admin/usuarios/{id} -> en el back pone activo = false
  desactivarUsuario(usuarioId: number) {
    return this.http.delete(`${this.apiUrl}/usuarios/${usuarioId}`, { responseType: 'text' });
  }

  // POST /admin/usuarios/{credentialId}/rol/ADMIN
  hacerAdmin(credentialId: number) {
    return this.http.post(`${this.apiUrl}/usuarios/${credentialId}/rol/ADMIN`, {}, { responseType: 'text' });
  }
}
