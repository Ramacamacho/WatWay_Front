import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ForoService } from '../../Servicios/foro-service';
import { Auth } from '../../Servicios/auth';
import { EstadoDibujo, EstadoForo, MapaUsa, NuevoTema, TemaResumen } from '../../Models/foro';

type Vista = 'mapa' | 'global';
// Qué formulario está abierto: tema en un estado, tema general o FAQ
type Formulario = 'estado' | 'general' | 'faq' | null;

@Component({
  selector: 'app-foro',
  imports: [RouterLink, DatePipe, NgTemplateOutlet, ReactiveFormsModule],
  templateUrl: './foro.html',
  styleUrl: './foro.css',
})
export class Foro implements OnInit {
  private foroService = inject(ForoService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  readonly esAdmin = this.auth.esAdmin;

  vista = signal<Vista>('mapa');
  mapa = signal<MapaUsa | null>(null);
  estados = signal<EstadoForo[]>([]);       // datos del back (empleadores, cantidad de temas)
  hover = signal<EstadoDibujo | null>(null); // estado bajo el mouse
  seleccionado = signal<string | null>(null);

  temas = signal<TemaResumen[]>([]);         // temas del estado elegido
  temasGlobales = signal<TemaResumen[]>([]);
  cargando = signal(false);
  error = signal('');

  formAbierto = signal<Formulario>(null);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  // Datos del back por código ("FL" -> {...}) para buscarlos rápido
  private porCodigo = computed(() => new Map(this.estados().map(e => [e.codigo, e])));

  estadoElegido = computed(() => {
    const codigo = this.seleccionado();
    return codigo ? this.mapa()?.estados.find(e => e.codigo === codigo) ?? null : null;
  });

  faqs = computed(() => this.temasGlobales().filter(t => t.tipo === 'FAQ'));
  generales = computed(() => this.temasGlobales().filter(t => t.tipo === 'NORMAL'));

  ngOnInit(): void {
    this.foroService.getMapa().subscribe({
      next: m => this.mapa.set(m),
      error: () => this.error.set('No se pudo cargar el mapa.'),
    });
    this.cargarEstados();

    // Al volver desde un tema se reabre lo que estabas mirando (?estado=FL o ?vista=global)
    const params = this.route.snapshot.queryParamMap;
    if (params.get('vista') === 'global') this.verGlobal();
    const estado = params.get('estado');
    if (estado) this.elegir(estado);
  }

  private cargarEstados() {
    this.foroService.getEstados().subscribe({
      next: lista => this.estados.set(lista),
      error: (err: HttpErrorResponse) => this.error.set(this.mensajeError(err, 'No se pudieron cargar los estados.')),
    });
  }

  // ---------- Mapa ----------

  cantidadTemas(codigo: string): number {
    return this.porCodigo().get(codigo)?.cantidadTemas ?? 0;
  }

  tieneEmpleadores(codigo: string): boolean {
    return this.porCodigo().get(codigo)?.tieneEmpleadores ?? false;
  }

  // Ancho del cartel con el nombre (aprox. 9px por letra)
  anchoCartel(nombre: string): number {
    return nombre.length * 9 + 20;
  }

  elegir(codigo: string) {
    this.seleccionado.set(codigo);
    this.cerrarFormulario();
    this.cargarTemasDeEstado(codigo);
  }

  private cargarTemasDeEstado(codigo: string) {
    this.cargando.set(true);
    this.error.set('');
    this.foroService.getTemasDeEstado(codigo).subscribe({
      next: lista => {
        this.temas.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudieron cargar los temas.'));
      },
    });
  }

  // ---------- Pestañas ----------

  verMapa() {
    this.vista.set('mapa');
    this.cerrarFormulario();
  }

  verGlobal() {
    this.vista.set('global');
    this.cerrarFormulario();
    this.cargando.set(true);
    this.foroService.getTemasGlobales().subscribe({
      next: lista => {
        this.temasGlobales.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo cargar el foro global.'));
      },
    });
  }

  // ---------- Crear tema (CREATE) ----------

  abrirFormulario(tipo: Formulario) {
    this.form.reset();
    this.error.set('');
    this.formAbierto.set(tipo);
  }

  cerrarFormulario() {
    this.formAbierto.set(null);
    this.form.reset();
  }

  invalido(campo: 'titulo' | 'contenido'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const tema: NuevoTema = this.form.getRawValue();
    const tipo = this.formAbierto();
    const codigo = this.seleccionado();

    const peticion =
      tipo === 'faq' ? this.foroService.crearFaq(tema)
      : tipo === 'general' ? this.foroService.crearTemaGlobal(tema)
      : this.foroService.crearTemaEnEstado(codigo!, tema);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        if (tipo === 'estado' && codigo) {
          this.cargarTemasDeEstado(codigo);
          this.cargarEstados(); // actualiza el contador del mapa
        } else {
          this.verGlobal();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo publicar el tema.'));
      },
    });
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    return err.error?.error || porDefecto;
  }
}
