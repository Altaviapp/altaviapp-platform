'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  GripVertical,
  Save,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInstitutionGrades, useInstitutionGradesMutation } from '@/hooks';

// Default grades for reset
const DEFAULT_GRADES = [
  'Prekinder',
  'Kinder',
  '1ro Básica',
  '2do Básica',
  '3ro Básica',
  '4to Básica',
  '5to Básica',
  '6to Básica',
  '7mo Básica',
  '8vo Básica',
  '9no Básica',
  '10mo Básica',
  '1ro Bachillerato',
  '2do Bachillerato',
  '3ro Bachillerato',
];

/**
 * Grades Settings Page
 *
 * Allows admin to configure custom grades for the institution.
 * These grades are used in student forms and filters.
 */
export default function GradesSettingsPage() {
  const [grades, setGrades] = useState<string[]>([]);
  const [newGrade, setNewGrade] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { grades: institutionGrades, isCustom, isLoading } = useInstitutionGrades();
  const { updateGrades } = useInstitutionGradesMutation();

  // Load existing grades
  useEffect(() => {
    if (institutionGrades.length > 0) {
      setGrades(institutionGrades);
    }
  }, [institutionGrades]);

  const handleAddGrade = () => {
    const trimmed = newGrade.trim();
    if (!trimmed) return;

    if (grades.includes(trimmed)) {
      setErrorMessage('Este grado ya existe');
      setSaveStatus('error');
      return;
    }

    setGrades([...grades, trimmed]);
    setNewGrade('');
    setHasChanges(true);
    setSaveStatus('idle');
    setErrorMessage('');
  };

  const handleRemoveGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newGrades = [...grades];
    const temp = newGrades[index - 1];
    newGrades[index - 1] = newGrades[index] as string;
    newGrades[index] = temp as string;
    setGrades(newGrades);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === grades.length - 1) return;
    const newGrades = [...grades];
    const temp = newGrades[index];
    newGrades[index] = newGrades[index + 1] as string;
    newGrades[index + 1] = temp as string;
    setGrades(newGrades);
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    setGrades(DEFAULT_GRADES);
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (grades.length === 0) {
      setErrorMessage('Debes tener al menos un grado');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      // If grades match defaults, pass empty to clear custom
      const isDefault = JSON.stringify(grades) === JSON.stringify(DEFAULT_GRADES);
      await updateGrades(isDefault ? [] : grades);

      setSaveStatus('success');
      setHasChanges(false);
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving grades:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar los grados');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar Grados</h1>
          <p className="text-gray-500">Define los grados disponibles para tu institución</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info">Grados personalizados</p>
            <p className="text-sm text-gray-600 mt-1">
              Estos grados aparecerán en los formularios de estudiantes y en los filtros de búsqueda.
              Puedes agregar, eliminar o reordenar los grados según las necesidades de tu institución.
            </p>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-4">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
            isCustom
              ? 'bg-accent/20 text-primary'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          {isCustom ? 'Configuración personalizada' : 'Usando valores predeterminados'}
        </span>
        {hasChanges && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
            Cambios sin guardar
          </span>
        )}
      </div>

      {/* Success Message */}
      {saveStatus === 'success' && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-sm font-medium text-success">Grados guardados correctamente</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {saveStatus === 'error' && errorMessage && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-sm text-error">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Lista de Grados</h2>
            <span className="text-sm text-gray-500">({grades.length})</span>
          </div>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar predeterminados
          </button>
        </div>

        {/* Add New Grade */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGrade();
                }
              }}
              placeholder="Agregar nuevo grado..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={handleAddGrade}
              disabled={!newGrade.trim()}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
                newGrade.trim()
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        {/* Grades List */}
        <div className="divide-y divide-gray-100">
          {grades.map((grade, index) => (
            <div
              key={`${grade}-${index}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={cn(
                    'p-0.5 rounded',
                    index === 0
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === grades.length - 1}
                  className={cn(
                    'p-0.5 rounded',
                    index === grades.length - 1
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
              </div>

              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-medium">
                {index + 1}
              </span>

              <span className="flex-1 text-sm text-gray-900">{grade}</span>

              <button
                onClick={() => handleRemoveGrade(index)}
                className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar grado"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {grades.length === 0 && (
          <div className="p-8 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay grados configurados</p>
            <p className="text-sm text-gray-400 mt-1">Agrega grados o restaura los predeterminados</p>
          </div>
        )}

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={cn(
                'px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                hasChanges
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Guardado
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>

            <Link
              href="/settings"
              className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Volver a Configuración
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
