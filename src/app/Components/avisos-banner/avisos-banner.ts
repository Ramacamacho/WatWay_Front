import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { Auth } from '../../Servicios/auth';
import { AvisoService } from '../../Servicios/aviso-service';
import { Aviso } from '../../Models/aviso';

// Franja debajo del header con los avisos activos del admin.
// Cada usuario puede cerrar un aviso: se recuerda en localStorage
// para no volver a mostrárselo en este navegador.
@Component({
  selector: 'app-avisos-banner',
  imports: [],
  templateUrl: './avisos-banner.html',
  styleUrl: './avisos-banner.css',
})
export class AvisosBanner implements OnDestroy {
  private auth = inject(Auth);
  private avisoService = inject(AvisoService);

  private avisos = signal<Aviso[]>([]);
  private cerrados = signal<number[]>(this.leerCerrados());

  // Lo que se muestra: los activos que el usuario no cerró
  visibles = computed(() => this.avisos().filter((a) => !this.cerrados().includes(a.id)));

  private intervalo?: ReturnType<typeof setInterval>;

  constructor() {
    // Cada vez que cambia la sesión (login / logout) se cargan o se limpian
    effect(() => {
      clearInterval(this.intervalo);
      if (this.auth.estaLogueado()) {
        this.cargar();
        // Revisa si hay avisos nuevos cada 60 segundos
        this.intervalo = setInterval(() => this.cargar(), 60000);
      } else {
        this.avisos.set([]);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  cerrar(a: Aviso) {
    this.cerrados.update((lista) => [...lista, a.id]);
    try {
      localStorage.setItem('avisosCerrados', JSON.stringify(this.cerrados()));
    } catch {
      // Si el navegador no deja guardar, el aviso igual se oculta hasta recargar
    }
  }

  private cargar() {
    this.avisoService.getActivos().subscribe({
      next: (lista) => this.avisos.set(lista),
      // Si falla no se muestra nada: los avisos no son imprescindibles
      error: () => this.avisos.set([]),
    });
  }

  private leerCerrados(): number[] {
    try {
      return JSON.parse(localStorage.getItem('avisosCerrados') ?? '[]');
    } catch {
      return [];
    }
  }
}
