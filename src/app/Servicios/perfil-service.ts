import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActualizarPerfil, Perfil } from '../Models/perfil';
import { Auth } from './auth';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private apiUrl = 'http://localhost:8080';

  // GET /usuarios/me
  getPerfil() {
    return this.http.get<Perfil>(`${this.apiUrl}/usuarios/me`);
  }

  // PUT /usuarios/me
  actualizarPerfil(datos: ActualizarPerfil) {
    return this.http.put<Perfil>(`${this.apiUrl}/usuarios/me`, datos);
  }

  // DELETE /auth/baja -> pide la contraseña, da de baja la cuenta e invalida los tokens
  eliminarCuenta(password: string) {
    return this.http.request('DELETE', `${this.apiUrl}/auth/baja`, {
      body: { refreshToken: this.auth.getRefreshToken(), password },
      responseType: 'text',
    });
  }

  // PUT /usuarios/me/password -> cambia la contraseña pidiendo la actual
  cambiarPassword(actual: string, nueva: string) {
    return this.http.put<void>(`${this.apiUrl}/usuarios/me/password`, { actual, nueva });
  }
}
