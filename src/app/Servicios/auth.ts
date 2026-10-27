import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { AuthResponse } from '../Models/auth-response';
import { RegisterRequest } from '../Models/register-request';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth';

  // Estado de sesión reactivo: se inicializa con lo que haya guardado
  private logueado = signal(!!localStorage.getItem('accessToken'));
  readonly estaLogueado = this.logueado.asReadonly();

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
    return this.http
      .post(
        `${this.apiUrl}/logout`,
        { refreshToken: this.getRefreshToken() },
        { responseType: 'text' }
      )
      .pipe(finalize(() => this.limpiarSesion()));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  limpiarSesion() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.logueado.set(false);
  }

  private guardarTokens(res: AuthResponse) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.logueado.set(true);
  }
}