import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { Perfil, PerfilUpdate } from '../Models/perfil';

@Injectable({
    providedIn:'root'
})
export class PerfilService {
    private url = 'http://localhost:8080/api/perfil';
constructor(private http:HttpClient){}

getPerfil() {
    return this.http.get<Perfil>(this.url);
  }

  eliminarCuenta() {
    return this.http.delete<void>(this.url);
  }
  actualizarPerfil(datos: PerfilUpdate) {
  return this.http.put<Perfil>(this.url, datos);
}
}
