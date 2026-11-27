// Coincide con AvisoDTO.java
export interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
  importante: boolean;
  activo: boolean;
  fechaCreacion: string;
  autorNombre: string;
}

// Coincide con CrearAvisoDTO.java
export interface NuevoAviso {
  titulo: string;
  mensaje: string;
  importante: boolean;
}
