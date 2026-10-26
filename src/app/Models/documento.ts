export enum Documento {
  DS_2019 = 'DS_2019',
  PASAPORTE = 'PASAPORTE',
  CARTA_DE_UNIVERSIDAD = 'CARTA_DE_UNIVERSIDAD',
  SEGURO_MEDICO = 'SEGURO_MEDICO',
  ANALITICO = 'ANALITICO',
  VISAJ1 = 'VISAJ1',
}

export const DOCUMENTO_LABEL: Record<Documento, string> = {
  [Documento.DS_2019]: 'DS-2019',
  [Documento.PASAPORTE]: 'Pasaporte',
  [Documento.CARTA_DE_UNIVERSIDAD]: 'Carta de la universidad',
  [Documento.SEGURO_MEDICO]: 'Seguro médico',
  [Documento.ANALITICO]: 'Analítico',
  [Documento.VISAJ1]: 'Visa J1',
};