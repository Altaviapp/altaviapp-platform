'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChecklistData, ChecklistItem } from '@/types';
import { getEmptyChecklist, getAllChecklistItems } from '@/lib/mockData';

interface UseChecklistStateReturn {
  // Estado
  checklistData: ChecklistData;
  observations: string;
  photo?: string;

  // Valores computados
  totalItems: number;
  completedItems: number;
  isComplete: boolean;
  hasIssues: boolean;
  issueItems: ChecklistItem[];
  progressPercentage: number;

  // Acciones
  toggleItem: (itemId: string) => void;
  markItemIssue: (itemId: string, hasIssue: boolean, description?: string) => void;
  setObservations: (text: string) => void;
  uploadPhoto: (file: File) => Promise<void>;
  submitChecklist: () => ChecklistData;
  reset: () => void;
}

/**
 * Custom hook para gestionar el estado del checklist pre-viaje
 *
 * Maneja los 17 ítems del checklist distribuidos en 4 categorías:
 * - Mecánica (5 items)
 * - Luces y Señales (4 items)
 * - Seguridad (6 items)
 * - Limpieza (2 items)
 */
export function useChecklistState(): UseChecklistStateReturn {
  const [checklistData, setChecklistData] = useState<ChecklistData>(getEmptyChecklist());
  const [observations, setObservationsState] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

  // Obtener todos los ítems como array plano
  const allItems = getAllChecklistItems(checklistData);

  // Valores computados
  const totalItems = 17;
  const completedItems = allItems.filter(item => item.checked).length;
  const isComplete = completedItems === totalItems;
  const hasIssues = allItems.some(item => item.hasIssue === true);
  const issueItems = allItems.filter(item => item.hasIssue === true);
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  /**
   * Toggle (marcar/desmarcar) un ítem del checklist
   */
  const toggleItem = useCallback((itemId: string) => {
    setChecklistData(prevData => {
      const newData = { ...prevData };

      // Buscar en cada categoría
      const categories: Array<keyof Pick<ChecklistData, 'mechanicalItems' | 'lightsItems' | 'safetyItems' | 'cleanlinessItems'>> = [
        'mechanicalItems',
        'lightsItems',
        'safetyItems',
        'cleanlinessItems'
      ];

      for (const category of categories) {
        const items = [...newData[category]];
        const index = items.findIndex(item => item.id === itemId);
        const currentItem = items[index];

        if (index !== -1 && currentItem) {
          items[index] = {
            ...currentItem,
            checked: !currentItem.checked
          };
          newData[category] = items;
          break;
        }
      }

      return newData;
    });
  }, []);

  /**
   * Marcar/desmarcar un ítem como problemático
   */
  const markItemIssue = useCallback((itemId: string, hasIssue: boolean, description?: string) => {
    setChecklistData(prevData => {
      const newData = { ...prevData };

      const categories: Array<keyof Pick<ChecklistData, 'mechanicalItems' | 'lightsItems' | 'safetyItems' | 'cleanlinessItems'>> = [
        'mechanicalItems',
        'lightsItems',
        'safetyItems',
        'cleanlinessItems'
      ];

      for (const category of categories) {
        const items = [...newData[category]];
        const index = items.findIndex(item => item.id === itemId);
        const currentItem = items[index];

        if (index !== -1 && currentItem) {
          items[index] = {
            ...currentItem,
            hasIssue,
            issueDescription: hasIssue ? description : undefined
          };
          newData[category] = items;
          break;
        }
      }

      return newData;
    });
  }, []);

  /**
   * Actualizar observaciones
   */
  const setObservations = useCallback((text: string) => {
    setObservationsState(text);
  }, []);

  /**
   * Subir foto (convierte a base64)
   */
  const uploadPhoto = useCallback(async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhoto(result);
        resolve();
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Enviar checklist completado
   * Retorna el objeto ChecklistData final
   */
  const submitChecklist = useCallback((): ChecklistData => {
    const allItems = getAllChecklistItems(checklistData);
    const hasIssues = allItems.some(item => item.hasIssue === true);
    const issues = allItems
      .filter(item => item.hasIssue === true)
      .map(item => `${item.label}: ${item.issueDescription || 'Sin descripción'}`);

    const completedData: ChecklistData = {
      ...checklistData,
      observations,
      photo,
      completedAt: new Date().toISOString(),
      hasIssues,
      issues: hasIssues ? issues : undefined
    };

    return completedData;
  }, [checklistData, observations, photo]);

  /**
   * Resetear el checklist al estado inicial
   */
  const reset = useCallback(() => {
    setChecklistData(getEmptyChecklist());
    setObservationsState('');
    setPhoto(undefined);
  }, []);

  return {
    // Estado
    checklistData,
    observations,
    photo,

    // Valores computados
    totalItems,
    completedItems,
    isComplete,
    hasIssues,
    issueItems,
    progressPercentage,

    // Acciones
    toggleItem,
    markItemIssue,
    setObservations,
    uploadPhoto,
    submitChecklist,
    reset,
  };
}
