'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  ChevronRight,
  ChevronLeft,
  Download,
  Loader2,
  X,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useValidateStudentImport,
  useStudentImportMutations,
  type StudentImportData,
} from '@/hooks';

type ImportStep = 'upload' | 'preview' | 'confirm';

// CSV parser helper
function parseCSV(text: string): StudentImportData[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  if (!headerLine) return [];
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());

  // Map common header variations
  const headerMap: Record<string, keyof StudentImportData> = {
    nombre: 'firstName',
    nombres: 'firstName',
    firstname: 'firstName',
    'first name': 'firstName',
    apellido: 'lastName',
    apellidos: 'lastName',
    lastname: 'lastName',
    'last name': 'lastName',
    grado: 'grade',
    grade: 'grade',
    curso: 'grade',
    direccion: 'address',
    address: 'address',
    email: 'parentEmail',
    'email padre': 'parentEmail',
    'email tutor': 'parentEmail',
    parentemail: 'parentEmail',
    'parent email': 'parentEmail',
    'nombre padre': 'parentName',
    'nombre tutor': 'parentName',
    parentname: 'parentName',
    telefono: 'parentPhone',
    'telefono padre': 'parentPhone',
    phone: 'parentPhone',
    parentphone: 'parentPhone',
    emergencia: 'emergencyContact',
    'contacto emergencia': 'emergencyContact',
    emergencycontact: 'emergencyContact',
  };

  const columnIndices: Partial<Record<keyof StudentImportData, number>> = {};
  headers.forEach((header, index) => {
    const normalizedHeader = header.replace(/['"]/g, '').trim();
    const mappedKey = headerMap[normalizedHeader];
    if (mappedKey) {
      columnIndices[mappedKey] = index;
    }
  });

  const students: StudentImportData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    // Simple CSV parsing (handles basic cases, not quoted commas)
    const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));

    const student: StudentImportData = {
      firstName: values[columnIndices.firstName ?? -1] || '',
      lastName: values[columnIndices.lastName ?? -1] || '',
      grade: values[columnIndices.grade ?? -1] || '',
      parentEmail: values[columnIndices.parentEmail ?? -1] || '',
      parentName: values[columnIndices.parentName ?? -1],
      parentPhone: values[columnIndices.parentPhone ?? -1],
      address: values[columnIndices.address ?? -1],
      emergencyContact: values[columnIndices.emergencyContact ?? -1],
    };

    // Only add if has required fields
    if (student.firstName || student.lastName || student.parentEmail) {
      students.push(student);
    }
  }

  return students;
}

// Sample CSV content for download
const SAMPLE_CSV = `Nombres,Apellidos,Grado,Email Padre,Nombre Padre,Telefono,Direccion
Juan,Pérez García,3ro,jperez@email.com,María García,+593991234567,Av. Principal 123
Ana,Pérez García,1ro,jperez@email.com,María García,+593991234567,Av. Principal 123
Carlos,Martínez,5to,cmartinez@email.com,Pedro Martínez,+593997654321,Calle 10 #45
`;

export default function StudentImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvData, setCsvData] = useState<StudentImportData[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [sendInvitations, setSendInvitations] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    summary: {
      totalStudents: number;
      createdStudents: number;
      failedStudents: number;
      totalHouseholds: number;
      invitationsSent: number;
    };
  } | null>(null);

  // Validation hook (only runs when we have data)
  const { validation, isLoading: isValidating } = useValidateStudentImport(csvData);
  const { importStudents } = useStudentImportMutations();

  // Handle file upload
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Por favor sube un archivo CSV');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      if (parsed.length > 0) {
        setStep('preview');
      }
    };
    reader.readAsText(file);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  // Download sample CSV
  const downloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_estudiantes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!csvData.length) return;

    setIsImporting(true);
    try {
      const result = await importStudents(csvData, sendInvitations);
      setImportResult({
        success: result.success,
        summary: result.summary,
      });
      setStep('confirm');
    } catch (error) {
      console.error('Import error:', error);
      alert('Error al importar estudiantes. Por favor intenta de nuevo.');
    } finally {
      setIsImporting(false);
    }
  }, [csvData, sendInvitations, importStudents]);

  // Reset and start over
  const handleReset = useCallback(() => {
    setCsvData([]);
    setFileName('');
    setStep('upload');
    setImportResult(null);
  }, []);

  // Computed values from validation
  const validStudents = useMemo(
    () => validation?.validationResults?.filter((r) => r.valid).length ?? 0,
    [validation]
  );
  const invalidStudents = useMemo(
    () => validation?.validationResults?.filter((r) => !r.valid).length ?? 0,
    [validation]
  );
  const householdsDetected = useMemo(
    () => validation?.households?.length ?? 0,
    [validation]
  );
  const newInvitationsNeeded = useMemo(
    () => validation?.summary?.newInvitationsNeeded ?? 0,
    [validation]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/students" className="hover:text-primary">
              Estudiantes
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Importar</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Importar Estudiantes</h1>
          <p className="text-gray-500">
            Carga un archivo CSV con los datos de los estudiantes
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          {[
            { id: 'upload', label: 'Cargar CSV', icon: Upload },
            { id: 'preview', label: 'Revisar Datos', icon: FileSpreadsheet },
            { id: 'confirm', label: 'Confirmar', icon: CheckCircle },
          ].map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg',
                  step === s.id
                    ? 'bg-primary text-white'
                    : index < ['upload', 'preview', 'confirm'].indexOf(step)
                    ? 'bg-success/10 text-success'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                <s.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{s.label}</span>
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2',
                    index < ['upload', 'preview', 'confirm'].indexOf(step)
                      ? 'bg-success'
                      : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="p-6 space-y-6">
            {/* Download Template */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Plantilla CSV</p>
                  <p className="text-sm text-blue-700">
                    Descarga la plantilla con el formato correcto
                  </p>
                </div>
              </div>
              <button
                onClick={downloadSample}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Descargar
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary/50'
              )}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-gray-500 mb-4">o haz clic para seleccionar</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
                Seleccionar Archivo
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {/* Format Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Formato del CSV</h3>
              <p className="text-sm text-gray-600 mb-3">
                El archivo debe tener las siguientes columnas (los encabezados pueden
                variar):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="px-2 py-1 bg-white rounded border">
                  <span className="text-red-500">*</span> Nombres
                </div>
                <div className="px-2 py-1 bg-white rounded border">
                  <span className="text-red-500">*</span> Apellidos
                </div>
                <div className="px-2 py-1 bg-white rounded border">
                  <span className="text-red-500">*</span> Grado
                </div>
                <div className="px-2 py-1 bg-white rounded border">
                  <span className="text-red-500">*</span> Email Padre
                </div>
                <div className="px-2 py-1 bg-white rounded border text-gray-500">
                  Nombre Padre
                </div>
                <div className="px-2 py-1 bg-white rounded border text-gray-500">
                  Teléfono
                </div>
                <div className="px-2 py-1 bg-white rounded border text-gray-500">
                  Dirección
                </div>
                <div className="px-2 py-1 bg-white rounded border text-gray-500">
                  Emergencia
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-red-500">*</span> Campos requeridos
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="p-6 space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-500">
                    {csvData.length} estudiantes encontrados
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isValidating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-500">Validando datos...</span>
              </div>
            ) : validation ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-2xl font-bold text-success">
                        {validStudents}
                      </span>
                    </div>
                    <p className="text-sm text-success/80 mt-1">Válidos</p>
                  </div>
                  {invalidStudents > 0 && (
                    <div className="p-4 bg-error/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-error" />
                        <span className="text-2xl font-bold text-error">
                          {invalidStudents}
                        </span>
                      </div>
                      <p className="text-sm text-error/80 mt-1">Con errores</p>
                    </div>
                  )}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {householdsDetected}
                      </span>
                    </div>
                    <p className="text-sm text-primary/80 mt-1">Hogares</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-warning" />
                      <span className="text-2xl font-bold text-warning">
                        {newInvitationsNeeded}
                      </span>
                    </div>
                    <p className="text-sm text-warning/80 mt-1">Nuevas invitaciones</p>
                  </div>
                </div>

                {/* Households List */}
                {validation.households && validation.households.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Hogares Detectados
                    </h3>
                    <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                      {validation.households.map((household, index) => (
                        <div
                          key={index}
                          className="p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {household.parentEmail}
                            </p>
                            <p className="text-sm text-gray-500">
                              {household.studentNames.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {household.userExists ? (
                              <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                                Usuario existe
                              </span>
                            ) : household.invitationPending ? (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                Invitación pendiente
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">
                                Nueva invitación
                              </span>
                            )}
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {household.studentIndices.length} estudiante
                              {household.studentIndices.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors List */}
                {invalidStudents > 0 && (
                  <div>
                    <h3 className="font-medium text-error mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Registros con Errores
                    </h3>
                    <div className="border border-error/20 rounded-lg divide-y max-h-48 overflow-y-auto">
                      {validation.validationResults
                        ?.filter((r) => !r.valid)
                        .map((result) => (
                          <div key={result.index} className="p-3 bg-error/5">
                            <p className="font-medium text-gray-900">
                              Fila {result.index + 2}:{' '}
                              {result.student.firstName || '(sin nombre)'}{' '}
                              {result.student.lastName || ''}
                            </p>
                            <ul className="text-sm text-error mt-1">
                              {result.errors.map((error, i) => (
                                <li key={i}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Estos registros no serán importados. Corrige el CSV y vuelve a
                      intentar si deseas incluirlos.
                    </p>
                  </div>
                )}

                {/* Send Invitations Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Enviar invitaciones a padres
                      </p>
                      <p className="text-sm text-blue-700">
                        Se enviarán {newInvitationsNeeded} emails de invitación
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendInvitations}
                      onChange={(e) => setSendInvitations(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Volver
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || validStudents === 0}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors',
                  isImporting || validStudents === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    Importar {validStudents} estudiantes
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm / Results */}
        {step === 'confirm' && importResult && (
          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Importación Completada
              </h2>
              <p className="text-gray-500">
                Los estudiantes han sido importados correctamente
              </p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {importResult.summary.createdStudents}
                </p>
                <p className="text-sm text-gray-500">Estudiantes creados</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">
                  {importResult.summary.totalHouseholds}
                </p>
                <p className="text-sm text-gray-500">Hogares</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-success">
                  {importResult.summary.invitationsSent}
                </p>
                <p className="text-sm text-gray-500">Invitaciones enviadas</p>
              </div>
              {importResult.summary.failedStudents > 0 && (
                <div className="p-4 bg-error/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-error">
                    {importResult.summary.failedStudents}
                  </p>
                  <p className="text-sm text-error/80">Con errores</p>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Los padres recibirán un email con instrucciones para crear su cuenta
                </li>
                <li>
                  • Cuando completen su registro, podrán confirmar la ubicación de recogida
                </li>
                <li>• Puedes asignar estudiantes a rutas desde la sección de Rutas</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Importar más
              </button>
              <Link
                href="/students"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Ver Estudiantes
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
