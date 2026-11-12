import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse } from '../Models/auth-response';
import { RegisterRequest } from '../Models/register-request';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/auth';

  // Estado de sesión reactivo: guardamos el token en un signal
  // y todo lo demás (logueado, roles, email) se calcula a partir de él.
  private token = signal<string | null>(localStorage.getItem('accessToken'));

  readonly estaLogueado = computed(() => !!this.token());

  // El back mete los roles en el token (claim "roles"), ej: ["USER", "ADMIN"]
  private datosToken = computed(() => this.leerToken(this.token()));
  readonly roles = computed<string[]>(() => this.datosToken()?.roles ?? []);
  readonly esAdmin = computed(() => this.roles().includes('ADMIN'));
  // El "sub" del token es el email del usuario logueado
  readonly email = computed<string | null>(() => this.datosToken()?.sub ?? null);

  // Alias para el código que venía de la rama match
  readonly isLoggedIn = this.estaLogueado;

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
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    // Se limpia ya mismo: el header cambia al primer clic
    this.limpiarSesion();

    // El token se manda a mano porque el interceptor ya no lo encuentra en localStorage
    const headers = accessToken
      ? new HttpHeaders({ Authorization: `Bearer ${accessToken}` })
      : undefined;

    return this.http.post(
      `${this.apiUrl}/logout`,
      { refreshToken },
      { headers, responseType: 'text' }
    );
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
    this.token.set(null);
  }

  private guardarTokens(res: AuthResponse) {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.token.set(res.accessToken);
  }

  // Un JWT tiene 3 partes separadas por puntos: header.payload.firma
  // El payload es JSON en base64url, así que se puede leer sin librerías.
  // Ojo: esto solo sirve para mostrar u ocultar cosas en pantalla.
  // La seguridad de verdad la hace el back, que sí verifica la firma.
  private leerToken(token: string | null): { sub?: string; roles?: string[] } | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}