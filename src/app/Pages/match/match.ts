import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatchService } from '../../Servicios/match-service';
import { UsuarioMatch } from '../../Models/usuario-match';

@Component({
  selector: 'app-match',
  imports: [RouterLink],
  styleUrl: './match.css',
  templateUrl: './match.html',
})
export class Match implements OnInit {
  private matchService = inject(MatchService);

  vista = signal<'descubrir' | 'matches'>('descubrir');
  candidato = signal<UsuarioMatch | null>(null);
  matches = signal<UsuarioMatch[]>([]);
  cargando = signal(false);
  sinCandidatos = signal(false);
  hayMatch = signal(false);
  error = signal('');
  // Id del match al que se le pide confirmación para eliminar
  confirmandoId = signal<number | null>(null);
  eliminando = signal(false);

  ngOnInit() {
    this.cargarCandidato();
  }

  cargarCandidato() {
    this.cargando.set(true);
    this.error.set('');
    this.sinCandidatos.set(false);

    this.matchService.getCandidato().subscribe({
      next: c => {
        this.candidato.set(c);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.candidato.set(null);
        this.cargando.set(false);
        // ⚠️ Depende de cómo responda tu GlobalExceptionHandler
        if (err.status === 404) {
          this.sinCandidatos.set(true);
        } else {
          this.error.set('No se pudo cargar el candidato');
        }
      },
    });
  }

  like() {
    this.evaluar(true);
  }

  dislike() {
    this.evaluar(false);
  }

  private evaluar(esLike: boolean) {
    const c = this.candidato();
    if (!c || this.cargando()) return;

    this.cargando.set(true);
    this.hayMatch.set(false);

    const peticion = esLike
      ? this.matchService.like(c.id)
      : this.matchService.dislike(c.id);

    peticion.subscribe({
      next: respuesta => {
        this.hayMatch.set(respuesta.includes('match'));
        this.cargarCandidato();
      },
      error: () => {
        this.error.set('No se pudo registrar tu elección');
        this.cargando.set(false);
      },
    });
  }

  verMatches() {
    this.vista.set('matches');
    this.matchService.getMatches().subscribe({
      next: lista => this.matches.set(lista),
      error: () => this.error.set('No se pudieron cargar tus matches'),
    });
  }

  pedirConfirmacion(id: number) {
    this.confirmandoId.set(id);
  }

  cancelarEliminar() {
    this.confirmandoId.set(null);
  }

  eliminarMatch(m: UsuarioMatch) {
    this.eliminando.set(true);
    this.error.set('');

    this.matchService.eliminarMatch(m.id).subscribe({
      next: () => {
        this.matches.update(lista => lista.filter(x => x.id !== m.id));
        this.confirmandoId.set(null);
        this.eliminando.set(false);
      },
      error: () => {
        this.error.set('No se pudo eliminar el match');
        this.confirmandoId.set(null);
        this.eliminando.set(false);
      },
    });
  }

  verDescubrir() {
    this.vista.set('descubrir');
    this.hayMatch.set(false);
    this.cargarCandidato();
  }
}