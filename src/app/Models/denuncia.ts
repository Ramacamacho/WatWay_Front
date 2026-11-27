// Coinciden con los enums y DTOs del back (DenunciaController)
export type TipoDenuncia = 'USUARIO' | 'MENSAJE' | 'TEMA_FORO' | 'RESPUESTA_FORO';
export type MotivoDenuncia = 'SPAM' | 'ACOSO' | 'CONTENIDO_INAPROPIADO' | 'PERFIL_FALSO' | 'OTRO';
export type EstadoDenuncia = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTA' | 'DESCARTADA';

export const MOTIVOS: { valor: MotivoDenuncia; texto: string }[] = [
  { valor: 'SPAM', texto: 'Spam o publicidad' },
  { valor: 'ACOSO', texto: 'Acoso o insultos' },
  { valor: 'CONTENIDO_INAPROPIADO', texto: 'Contenido inapropiado' },
  { valor: 'PERFIL_FALSO', texto: 'Perfil falso' },
  { valor: 'OTRO', texto: 'Otro' },
];

export const TEXTO_TIPO: Record<TipoDenuncia, string> = {
  USUARIO: 'Perfil',
  MENSAJE: 'Mensaje del chat',
  TEMA_FORO: 'Tema del foro',
  RESPUESTA_FORO: 'Respuesta del foro',
};

export const TEXTO_ESTADO: Record<EstadoDenuncia, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTA: 'Resuelta',
  DESCARTADA: 'Descartada',
};

// CrearDenunciaDTO.java
export interface NuevaDenuncia {
  tipo: TipoDenuncia;
  referenciaId: number;
  motivo: MotivoDenuncia;
  descripcion?: string;
}

// DenunciaDTO.java
export interface Denuncia {
  id: number;
  tipo: TipoDenuncia;
  referenciaId: number;
  motivo: MotivoDenuncia;
  descripcion: string | null;
  contenidoDenunciado: string | null;
  estado: EstadoDenuncia;
  denuncianteNombre: string;
  denunciadoId: number;
  denunciadoNombre: string;
  denunciadoActivo: boolean;
  fechaCreacion: string;
  fechaCierre: string | null;
  notaAdmin: string | null;
  medidas: string | null;
  revisadaPorNombre: string | null;
}

// ResolverDenunciaDTO.java
export interface DecisionDenuncia {
  nota?: string;
  borrarContenido?: boolean;
  desactivarUsuario?: boolean;
}
