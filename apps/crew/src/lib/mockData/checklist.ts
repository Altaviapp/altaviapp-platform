/**
 * Mock Data: Checklist Template
 * Template del checklist pre-viaje con 17 ítems distribuidos en 4 categorías
 */

import type { ChecklistData, ChecklistItem } from '@/types';

/**
 * Template de checklist vacío (sin marcar)
 * Se usa como base al iniciar un nuevo checklist
 */
export const checklistTemplate: ChecklistData = {
  mechanicalItems: [
    { id: 'mech-01', label: 'Frenos', checked: false },
    { id: 'mech-02', label: 'Neumáticos', checked: false },
    { id: 'mech-03', label: 'Motor', checked: false },
    { id: 'mech-04', label: 'Combustible', checked: false },
    { id: 'mech-05', label: 'Batería', checked: false },
  ],
  lightsItems: [
    { id: 'lights-01', label: 'Luces delanteras', checked: false },
    { id: 'lights-02', label: 'Luces traseras', checked: false },
    { id: 'lights-03', label: 'Direccionales', checked: false },
    { id: 'lights-04', label: 'Luces de emergencia', checked: false },
  ],
  safetyItems: [
    { id: 'safety-01', label: 'Cinturones de seguridad', checked: false },
    { id: 'safety-02', label: 'Puertas y ventanas', checked: false },
    { id: 'safety-03', label: 'Espejos retrovisores', checked: false },
    { id: 'safety-04', label: 'Extintor', checked: false },
    { id: 'safety-05', label: 'Botiquín de primeros auxilios', checked: false },
    { id: 'safety-06', label: 'Triángulos de seguridad', checked: false },
  ],
  cleanlinessItems: [
    { id: 'clean-01', label: 'Interior limpio', checked: false },
    { id: 'clean-02', label: 'Parabrisas limpio', checked: false },
  ],
  hasIssues: false,
};

/**
 * Ejemplo de checklist completado sin problemas
 * Se usa para mostrar datos en viajes pasados
 */
export const completedChecklistExample: ChecklistData = {
  mechanicalItems: [
    { id: 'mech-01', label: 'Frenos', checked: true },
    { id: 'mech-02', label: 'Neumáticos', checked: true },
    { id: 'mech-03', label: 'Motor', checked: true },
    { id: 'mech-04', label: 'Combustible', checked: true },
    { id: 'mech-05', label: 'Batería', checked: true },
  ],
  lightsItems: [
    { id: 'lights-01', label: 'Luces delanteras', checked: true },
    { id: 'lights-02', label: 'Luces traseras', checked: true },
    { id: 'lights-03', label: 'Direccionales', checked: true },
    { id: 'lights-04', label: 'Luces de emergencia', checked: true },
  ],
  safetyItems: [
    { id: 'safety-01', label: 'Cinturones de seguridad', checked: true },
    { id: 'safety-02', label: 'Puertas y ventanas', checked: true },
    { id: 'safety-03', label: 'Espejos retrovisores', checked: true },
    { id: 'safety-04', label: 'Extintor', checked: true },
    { id: 'safety-05', label: 'Botiquín de primeros auxilios', checked: true },
    { id: 'safety-06', label: 'Triángulos de seguridad', checked: true },
  ],
  cleanlinessItems: [
    { id: 'clean-01', label: 'Interior limpio', checked: true },
    { id: 'clean-02', label: 'Parabrisas limpio', checked: true },
  ],
  observations: 'Todo en perfecto estado',
  completedAt: '2025-11-26T06:28:00.000Z',
  hasIssues: false,
};

/**
 * Ejemplo de checklist con problemas detectados
 * Útil para testing del flujo de manejo de problemas
 */
export const checklistWithIssuesExample: ChecklistData = {
  mechanicalItems: [
    { id: 'mech-01', label: 'Frenos', checked: true },
    {
      id: 'mech-02',
      label: 'Neumáticos',
      checked: true,
      hasIssue: true,
      issueDescription: 'Neumático delantero izquierdo con presión baja'
    },
    { id: 'mech-03', label: 'Motor', checked: true },
    { id: 'mech-04', label: 'Combustible', checked: true },
    { id: 'mech-05', label: 'Batería', checked: true },
  ],
  lightsItems: [
    { id: 'lights-01', label: 'Luces delanteras', checked: true },
    { id: 'lights-02', label: 'Luces traseras', checked: true },
    { id: 'lights-03', label: 'Direccionales', checked: true },
    { id: 'lights-04', label: 'Luces de emergencia', checked: true },
  ],
  safetyItems: [
    { id: 'safety-01', label: 'Cinturones de seguridad', checked: true },
    { id: 'safety-02', label: 'Puertas y ventanas', checked: true },
    { id: 'safety-03', label: 'Espejos retrovisores', checked: true },
    { id: 'safety-04', label: 'Extintor', checked: true },
    { id: 'safety-05', label: 'Botiquín de primeros auxilios', checked: true },
    { id: 'safety-06', label: 'Triángulos de seguridad', checked: true },
  ],
  cleanlinessItems: [
    { id: 'clean-01', label: 'Interior limpio', checked: true },
    { id: 'clean-02', label: 'Parabrisas limpio', checked: true },
  ],
  observations: 'Problema menor con neumático, continuando con precaución',
  completedAt: '2025-11-27T06:15:00.000Z',
  hasIssues: true,
  issues: ['Neumático delantero izquierdo con presión baja'],
};

/**
 * Obtiene un template vacío del checklist
 * Útil para inicializar el estado del checklist
 */
export function getEmptyChecklist(): ChecklistData {
  return JSON.parse(JSON.stringify(checklistTemplate));
}

/**
 * Obtiene todos los ítems del checklist como un array plano
 * Útil para cálculos de progreso y validación
 */
export function getAllChecklistItems(data: ChecklistData): ChecklistItem[] {
  return [
    ...data.mechanicalItems,
    ...data.lightsItems,
    ...data.safetyItems,
    ...data.cleanlinessItems,
  ];
}

/**
 * Cuenta el número total de ítems en el checklist
 */
export function getTotalChecklistItems(): number {
  return 17; // 5 + 4 + 6 + 2
}

/**
 * Cuenta el número de ítems completados
 */
export function getCompletedChecklistItems(data: ChecklistData): number {
  return getAllChecklistItems(data).filter(item => item.checked).length;
}

/**
 * Verifica si todos los ítems están completados
 */
export function isChecklistComplete(data: ChecklistData): boolean {
  return getCompletedChecklistItems(data) === getTotalChecklistItems();
}

/**
 * Verifica si hay problemas en el checklist
 */
export function hasChecklistIssues(data: ChecklistData): boolean {
  return getAllChecklistItems(data).some(item => item.hasIssue === true);
}

/**
 * Obtiene todos los ítems con problemas
 */
export function getChecklistIssues(data: ChecklistData): ChecklistItem[] {
  return getAllChecklistItems(data).filter(item => item.hasIssue === true);
}
