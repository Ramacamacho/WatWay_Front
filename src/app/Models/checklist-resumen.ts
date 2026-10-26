import { ChecklistItem } from "./checklist-item";

export interface ChecklistResumen {
     checklistId: number;
  progreso: number;
  completados: ChecklistItem[],
  faltantes: ChecklistItem[],
}
