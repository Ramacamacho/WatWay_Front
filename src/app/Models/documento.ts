export type Documento =
  | 'PASAPORTE'
  | 'ANALITICO'
  | 'CARTA_DE_UNIVERSIDAD'
  | 'SEGURO_MEDICO'
  | 'CONTRATO_AGENCIA'
  | 'JOB_OFFER'
  | 'DS_2019'
  | 'PAGO_SEVIS'
  | 'DS_160'
  | 'TURNO_EMBAJADA'
  | 'VISAJ1'
  | 'PASAJE_AEREO'
  | 'ALOJAMIENTO'
  | 'I94'
  | 'SSN'
  | 'W2';

export const DOCUMENTO_LABEL: Record<string, string> = {
  PASAPORTE: 'Pasaporte vigente',
  ANALITICO: 'Analítico',
  CARTA_DE_UNIVERSIDAD: 'Carta de la universidad',
  SEGURO_MEDICO: 'Seguro médico',
  CONTRATO_AGENCIA: 'Contrato con la agencia / sponsor',
  JOB_OFFER: 'Job offer (oferta de empleo)',
  DS_2019: 'Formulario DS-2019',
  PAGO_SEVIS: 'Pago del SEVIS (I-901)',
  DS_160: 'Formulario DS-160',
  TURNO_EMBAJADA: 'Turno en la embajada',
  VISAJ1: 'Visa J-1',
  PASAJE_AEREO: 'Pasaje aéreo',
  ALOJAMIENTO: 'Alojamiento (housing)',
  I94: 'I-94',
  SSN: 'Social Security Number (SSN)',
  W2: 'W-2 (impuestos)',
};