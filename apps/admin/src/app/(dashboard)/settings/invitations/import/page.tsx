'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface ParsedInvitation {
  email: string;
  name: string;
  role: string;
  valid: boolean;
  error?: string;
}

export default function ImportInvitationsPage() {
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const validRoles = ['parent', 'driver', 'monitor', 'admin'];

  const parseCSV = (content: string): ParsedInvitation[] => {
    const lines = content.trim().split('\n');
    const results: ParsedInvitation[] = [];

    // Skip header if present
    const firstLine = lines[0] ?? '';
    const startIndex = firstLine.toLowerCase().includes('email') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = (lines[i] ?? '').trim();
      if (!line) continue;

      const [email, name, role] = line.split(',').map(s => s.trim());

      let valid = true;
      let errorMsg = '';

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        valid = false;
        errorMsg = 'Email inválido';
      }

      // Validate role
      if (!role || !validRoles.includes(role.toLowerCase())) {
        valid = false;
        errorMsg = errorMsg ? `${errorMsg}, rol inválido` : 'Rol inválido';
      }

      results.push({
        email: email || '',
        name: name || '',
        role: role?.toLowerCase() || '',
        valid,
        error: errorMsg || undefined,
      });
    }

    return results;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV');
      return;
    }

    setFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content);
      setParsedData(parsed);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template = 'email,nombre,rol\nmaria@email.com,María García,parent\njuan@email.com,Juan Pérez,driver\nana@email.com,Ana López,monitor';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_invitaciones.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    const validInvitations = parsedData.filter(d => d.valid);
    if (validInvitations.length === 0) {
      setError('No hay invitaciones válidas para procesar');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSuccess(true);
    setIsLoading(false);
  };

  const handleClear = () => {
    setFile(null);
    setParsedData([]);
    setError('');
    setSuccess(false);
  };

  const validCount = parsedData.filter(d => d.valid).length;
  const invalidCount = parsedData.filter(d => !d.valid).length;

  // ============================================
  // SUCCESS STATE
  // ============================================

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Importación Exitosa!
            </h1>
            <p className="text-gray-600">
              Se crearon {validCount} invitaciones correctamente
            </p>
          </div>

          {sendEmail && (
            <div className="flex items-center justify-center gap-2 text-sm text-success mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>Emails enviados automáticamente</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                handleClear();
                setSuccess(false);
              }}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Importar más
            </button>
            <button
              onClick={() => router.push('/settings/invitations')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Ver invitaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // FORM STATE
  // ============================================

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/settings/invitations')}
          className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Invitaciones
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Importar Invitaciones</h1>
        <p className="text-gray-600 text-sm mt-1">
          Carga un archivo CSV para crear múltiples invitaciones
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Instructions & Upload */}
        <div className="space-y-6">
          {/* Format Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Formato del archivo CSV
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm mb-4">
              <p className="text-gray-500 mb-2">email,nombre,rol</p>
              <p className="text-gray-700">maria@email.com,María García,parent</p>
              <p className="text-gray-700">juan@email.com,Juan Pérez,driver</p>
              <p className="text-gray-700">ana@email.com,Ana López,monitor</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Roles válidos:</strong> parent, driver, monitor, admin</p>
              <p><strong>Límite:</strong> Hasta 100 invitaciones por archivo</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="mt-4 text-primary hover:underline text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla CSV
            </button>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cargar archivo
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-error-light border border-error rounded-lg text-sm text-error-dark flex items-center gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-sm text-gray-500 mb-4">o</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <span className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-lg cursor-pointer transition-colors">
                    Seleccionar archivo
                  </span>
                </label>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {parsedData.length} filas encontradas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClear}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Options */}
            {file && (
              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Enviar emails de invitación automáticamente
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Vista previa
          </h2>

          {parsedData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Carga un archivo CSV para ver la vista previa</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-gray-600">{validCount} válidos</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-error" />
                    <span className="text-gray-600">{invalidCount} con errores</span>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Email</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Nombre</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Rol</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.map((row, index) => (
                      <tr
                        key={index}
                        className={row.valid ? '' : 'bg-red-50'}
                      >
                        <td className="px-3 py-2 text-gray-900">{row.email || '-'}</td>
                        <td className="px-3 py-2 text-gray-700">{row.name || '-'}</td>
                        <td className="px-3 py-2 text-gray-700">{row.role || '-'}</td>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <span className="text-xs text-error">{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleClear}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || validCount === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Procesando...' : `Crear ${validCount} invitaciones`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
