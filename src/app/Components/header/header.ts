import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../Servicios/auth';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
 auth = inject(Auth);
  private router = inject(Router);

  

cerrarSesion() {
    this.auth.limpiarSesion(); // Limpia localmente y apaga la señal al instante
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
