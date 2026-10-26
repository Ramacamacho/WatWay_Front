import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UsuarioMatch } from '../Models/usuario-match';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private http = inject(HttpClient);

  // ⚠️ Ajustá el prefijo y las rutas a las de tu MatchController
  private apiUrl = 'http://localhost:8080/match';

  getCandidato() {
    return this.http.get<UsuarioMatch>(`${this.apiUrl}/candidato`);
  }

  like(id: number) {
    return this.http.post(`${this.apiUrl}/like/${id}`, {}, { responseType: 'text' });
  }

  dislike(id: number) {
    return this.http.post(`${this.apiUrl}/dislike/${id}`, {}, { responseType: 'text' });
  }

  getMatches() {
    return this.http.get<UsuarioMatch[]>(`${this.apiUrl}/matches`);
  }
}