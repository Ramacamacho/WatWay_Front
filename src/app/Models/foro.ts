// Mismos campos que los DTO del back (ForoController)

export type TipoTema = 'NORMAL' | 'FAQ';

// GET /foro/estados
export interface EstadoForo {
  codigo: string;
  nombre: string;
  region: string;
  tieneEmpleadores: boolean;
  cantidadTemas: number;
}

// Un tema en un listado
export interface TemaResumen {
  id: number;
  titulo: string;
  tipo: TipoTema;
  autorNombre: string;
  fechaCreacion: string;
  cantidadRespuestas: number;
}

export interface Respuesta {
  id: number;
  contenido: string;
  autorNombre: string;
  fechaCreacion: string;
  fechaEdicion: string | null;
  puedeEditar: boolean;
  puedeBorrar: boolean;
}

// GET /foro/temas/{id}
export interface TemaDetalle {
  id: number;
  titulo: string;
  contenido: string;
  tipo: TipoTema;
  estadoCodigo: string | null; // null = foro global
  estadoNombre: string | null;
  autorNombre: string;
  fechaCreacion: string;
  fechaEdicion: string | null;
  puedeEditar: boolean;
  puedeBorrar: boolean;
  respuestas: Respuesta[];
}

export interface NuevoTema {
  titulo: string;
  contenido: string;
}

// Dibujo del mapa: public/data/estados-usa.json (no viene del back)
export interface EstadoDibujo {
  codigo: string;
  nombre: string;
  region: string;
  color: string;  // color emblemático del estado
  motivo: string; // de dónde sale ese color
  x: number;      // centro del estado (para el cartel al pasar el mouse)
  y: number;
  d: string;      // trazo SVG del estado
}

export interface MapaUsa {
  viewBox: string;
  estados: EstadoDibujo[];
  regiones: { nombre: string; d: string }[];
}
