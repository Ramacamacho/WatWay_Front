import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse } from '../Models/auth-response';
import { RegisterRequest } from '../Models/register-request';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth';

  // 1. Creamos la señal reactiva que detecta si hay token al arrancar
  isLoggedIn = signal<boolean>(!!localStorage.getItem('accessToken'));

  registrar(datos: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, datos)
      .pipe(tap(res => this.guardarTokens(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.guardarTokens(res)));
  }

  logout() {
    // 2. Limpiamos la sesión de inmediato para que el Header cambie al primer clic
    const refreshToken = this.getRefreshToken();
    this.limpiarSesion();

    return this.http.post(
      `${this.apiUrl}/logout`,
      { refreshToken },
      { responseType: 'text' }
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  estaLogueado(): boolean {
    return !!this.getAccessToken();
  }

  limpiarSesion() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isLoggedIn.set(false); // 3. Apaga la señal al instante (Cerrar sesión)
  }

  private guardarTokens(res: AuthResponse) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.isLoggedIn.set(true); // 4. Enciende la señal al instante (Iniciar sesión)
  }
}