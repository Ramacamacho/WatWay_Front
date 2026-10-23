import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../Models/register-request';

@Service()
export class Auth {
     private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth'; // cambialo por tu ruta real

  register(datos: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/register`, datos);
    }
}
