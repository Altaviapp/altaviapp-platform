"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { useConvexAuth } from "@/hooks/useConvexAuth";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Satellite,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Truck,
} from "lucide-react";
import Link from "next/link";

type WizardStep = "wait" | "map" | "test" | "assign";

interface FieldMapping {
  latitude: string;
  longitude: string;
  speed?: string;
  heading?: string;
  timestamp?: string;
  deviceIdField: string;
}

export default function ConfigureDevicePage() {
  const params = useParams();
  const router = useRouter();
  const { userId, user } = useConvexAuth();
  const deviceId = params.id as Id<"gpsDevices">;

  const [currentStep, setCurrentStep] = useState<WizardStep>("wait");
  const [selectedSampleId, setSelectedSampleId] = useState<Id<"gpsWebhookSamples"> | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    latitude: "",
    longitude: "",
    deviceIdField: "",
  });
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latitude?: number;
    longitude?: number;
    speed?: number;
    heading?: number;
    timestamp?: number;
    deviceId?: string;
    errors: string[];
  } | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<Id<"vehicles"> | null>(null);

  const institutionId = user?.institutionId as Id<"institutions"> | undefined;

  const device = useQuery(
    api.gpsDevices.getDevice,
    userId && deviceId ? { userId, deviceId } : "skip"
  );

  const samples = useQuery(
    api.gpsWebhook.getSandboxSamples,
    userId && institutionId
      ? { userId, institutionId, limit: 20, unprocessedOnly: true }
      : "skip"
  );

  const vehicles = useQuery(
    api.vehicles.listVehicles,
    userId && institutionId
      ? { userId, institutionId, isActive: true }
      : "skip"
  );

  const selectedSample = useQuery(
    api.gpsWebhook.getSample,
    userId && selectedSampleId ? { userId, sampleId: selectedSampleId } : "skip"
  );

  const updateFieldMappingMutation = useMutation(api.gpsDevices.updateFieldMapping);
  const activateDeviceMutation = useMutation(api.gpsDevices.activateDevice);
  const assignToVehicleMutation = useMutation(api.gpsDevices.assignToVehicle);

  // Auto-detect step based on device status
  useEffect(() => {
    if (device) {
      if (device.status === "active" && device.fieldMapping) {
        setCurrentStep("assign");
        setFieldMapping(device.fieldMapping);
      } else if (device.fieldMapping) {
        setCurrentStep("test");
        setFieldMapping(device.fieldMapping);
      }
    }
  }, [device]);

  // Auto-suggest mappings when sample is selected
  useEffect(() => {
    if (selectedSample?.fieldPaths && currentStep === "map") {
      const suggestions = suggestMappings(selectedSample.fieldPaths);
      setFieldMapping((prev) => ({
        ...prev,
        ...suggestions,
      }));
    }
  }, [selectedSample, currentStep]);

  const suggestMappings = (fieldPaths: { path: string; value: unknown; type: string }[]) => {
    const suggestions: Partial<FieldMapping> = {};
    const patterns = {
      latitude: /^(lat|latitude)$/i,
      longitude: /^(lon|lng|longitude)$/i,
      speed: /^(speed|velocity|spd)$/i,
      heading: /^(heading|bearing|course|direction)$/i,
      timestamp: /^(timestamp|time|datetime|ts|created_at|epoch)$/i,
      deviceIdField: /^(device_?id|imei|serial|tracker_?id|id)$/i,
    };

    for (const field of fieldPaths) {
      const lastPart = field.path.split(".").pop() || "";
      for (const [key, pattern] of Object.entries(patterns)) {
        if (pattern.test(lastPart) && !suggestions[key as keyof FieldMapping]) {
          suggestions[key as keyof FieldMapping] = field.path;
        }
      }
    }

    return suggestions;
  };

  const handleTestMapping = async () => {
    if (!selectedSample?.rawPayload || !userId || !institutionId) return;

    try {
      const result = await fetch("/api/test-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: selectedSample.rawPayload,
          fieldMapping,
        }),
      }).then((r) => r.json());

      setTestResult(result);
    } catch (err) {
      // If API not available, do client-side test
      const payload = JSON.parse(selectedSample.rawPayload);
      const result = testMappingLocally(payload, fieldMapping);
      setTestResult(result);
    }
  };

  const testMappingLocally = (payload: Record<string, unknown>, mapping: FieldMapping) => {
    const errors: string[] = [];

    const getValue = (obj: unknown, path: string): unknown => {
      const parts = path.split(/\.|\[|\]/).filter(Boolean);
      let current: unknown = obj;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current === "object") {
          current = (current as Record<string, unknown>)[part];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const lat = getValue(payload, mapping.latitude);
    const lon = getValue(payload, mapping.longitude);
    const deviceIdVal = getValue(payload, mapping.deviceIdField);

    if (typeof lat !== "number") {
      errors.push(`Latitude: no se encontró un número en "${mapping.latitude}"`);
    }
    if (typeof lon !== "number") {
      errors.push(`Longitude: no se encontró un número en "${mapping.longitude}"`);
    }
    if (typeof deviceIdVal !== "string" || deviceIdVal.length === 0) {
      errors.push(`Device ID: no se encontró texto en "${mapping.deviceIdField}"`);
    }

    return {
      success: errors.length === 0,
      latitude: typeof lat === "number" ? lat : undefined,
      longitude: typeof lon === "number" ? lon : undefined,
      speed: mapping.speed ? (getValue(payload, mapping.speed) as number | undefined) : undefined,
      heading: mapping.heading ? (getValue(payload, mapping.heading) as number | undefined) : undefined,
      timestamp: mapping.timestamp ? (getValue(payload, mapping.timestamp) as number | undefined) : undefined,
      deviceId: typeof deviceIdVal === "string" ? deviceIdVal : undefined,
      errors,
    };
  };

  const handleSaveMapping = async () => {
    if (!userId || !deviceId) return;

    try {
      await updateFieldMappingMutation({
        userId,
        deviceId,
        fieldMapping: {
          ...fieldMapping,
          speed: fieldMapping.speed || undefined,
          heading: fieldMapping.heading || undefined,
          timestamp: fieldMapping.timestamp || undefined,
        },
      });
      setCurrentStep("test");
    } catch (err: any) {
      alert(err.message || "Error al guardar configuración");
    }
  };

  const handleActivate = async () => {
    if (!userId || !deviceId) return;

    try {
      await activateDeviceMutation({ userId, deviceId });
      setCurrentStep("assign");
    } catch (err: any) {
      alert(err.message || "Error al activar dispositivo");
    }
  };

  const handleAssign = async () => {
    if (!userId || !deviceId || !selectedVehicleId) return;

    try {
      await assignToVehicleMutation({
        userId,
        deviceId,
        vehicleId: selectedVehicleId,
        reason: "Configuración inicial",
      });
      router.push("/fleet/gps-devices");
    } catch (err: any) {
      alert(err.message || "Error al asignar vehículo");
    }
  };

  const handleSkipAssign = () => {
    router.push("/fleet/gps-devices");
  };

  if (!device) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const steps = [
    { id: "wait", label: "Recibir datos" },
    { id: "map", label: "Mapear campos" },
    { id: "test", label: "Probar" },
    { id: "assign", label: "Asignar vehículo" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Configurar: ${device.name}`}
        subtitle={`ID: ${device.deviceId}`}
        backHref="/fleet/gps-devices"
      />

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStepIndex
                      ? "bg-green-500 text-white"
                      : index === currentStepIndex
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className="text-xs text-gray-600 mt-2">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Wait for data */}
        {currentStep === "wait" && (
          <WaitForDataStep
            device={device}
            samples={samples || []}
            onSelectSample={(id) => {
              setSelectedSampleId(id);
              setCurrentStep("map");
            }}
          />
        )}

        {/* Step 2: Map fields */}
        {currentStep === "map" && selectedSample && (
          <MapFieldsStep
            sample={selectedSample}
            fieldMapping={fieldMapping}
            onFieldMappingChange={setFieldMapping}
            onBack={() => {
              setSelectedSampleId(null);
              setCurrentStep("wait");
            }}
            onNext={handleSaveMapping}
            deviceId={device.deviceId}
          />
        )}

        {/* Step 3: Test */}
        {currentStep === "test" && (
          <TestStep
            device={device}
            fieldMapping={fieldMapping}
            samples={samples || []}
            testResult={testResult}
            onTest={handleTestMapping}
            onSelectSample={setSelectedSampleId}
            selectedSampleId={selectedSampleId}
            onBack={() => setCurrentStep("map")}
            onActivate={handleActivate}
          />
        )}

        {/* Step 4: Assign vehicle */}
        {currentStep === "assign" && (
          <AssignVehicleStep
            vehicles={vehicles || []}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            onAssign={handleAssign}
            onSkip={handleSkipAssign}
            currentVehicle={device.vehicle}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// STEP 1: WAIT FOR DATA
// ============================================

function WaitForDataStep({
  device,
  samples,
  onSelectSample,
}: {
  device: any;
  samples: any[];
  onSelectSample: (id: Id<"gpsWebhookSamples">) => void;
}) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const sandboxEndpoint = `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site')}/gps/sandbox`;

  const copyToClipboard = async (text: string, type: "endpoint" | "token") => {
    await navigator.clipboard.writeText(text);
    if (type === "endpoint") {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Satellite className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Esperando datos del dispositivo</h2>
        <p className="text-gray-600 mt-2">
          Configura tu dispositivo GPS para enviar datos al endpoint de sandbox
        </p>
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-blue-900">Endpoint (Sandbox)</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono break-all">
              {sandboxEndpoint}
            </code>
            <button
              onClick={() => copyToClipboard(sandboxEndpoint, "endpoint")}
              className="p-2 hover:bg-blue-100 rounded transition-colors"
            >
              {copiedEndpoint ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-blue-900">Token de autenticación</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono">
              {device.institutionApiToken || "No disponible"}
            </code>
            <button
              onClick={() => copyToClipboard(device.institutionApiToken || "", "token")}
              className="p-2 hover:bg-blue-100 rounded transition-colors"
              disabled={!device.institutionApiToken}
            >
              {copiedToken ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-blue-700">
          <p className="font-medium">Configura tu dispositivo para enviar:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Método: <code>POST</code></li>
            <li>Header: <code>X-Institution-Token: {device.institutionApiToken?.slice(0, 10)}...</code></li>
            <li>Body: JSON con las coordenadas GPS</li>
          </ul>
        </div>
      </div>

      {/* Received Samples */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Datos recibidos</h3>
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        </div>

        {samples.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Esperando datos del dispositivo...</p>
            <p className="text-xs text-gray-400 mt-1">
              Los datos aparecerán aquí cuando el dispositivo envíe su primera ubicación
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {samples.map((sample) => (
              <div
                key={sample._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectSample(sample._id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-600 truncate">
                    {sample.rawPayload.slice(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Recibido hace {sample.receivedAgo < 60 ? "segundos" : `${Math.floor(sample.receivedAgo / 60)} min`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STEP 2: MAP FIELDS
// ============================================

function MapFieldsStep({
  sample,
  fieldMapping,
  onFieldMappingChange,
  onBack,
  onNext,
  deviceId,
}: {
  sample: any;
  fieldMapping: FieldMapping;
  onFieldMappingChange: (mapping: FieldMapping) => void;
  onBack: () => void;
  onNext: () => void;
  deviceId: string;
}) {
  const fieldPaths = sample.fieldPaths || [];
  const payload = sample.payload || {};

  const getValue = (obj: unknown, path: string): unknown => {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const requiredFields = [
    { key: "latitude", label: "Latitud", required: true },
    { key: "longitude", label: "Longitud", required: true },
    { key: "deviceIdField", label: "ID del dispositivo", required: true },
  ];

  const optionalFields = [
    { key: "speed", label: "Velocidad" },
    { key: "heading", label: "Rumbo" },
    { key: "timestamp", label: "Timestamp" },
  ];

  const isValid =
    fieldMapping.latitude &&
    fieldMapping.longitude &&
    fieldMapping.deviceIdField;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Mapear campos del JSON</h2>
        <p className="text-gray-600 mt-1">
          Selecciona qué campo del JSON corresponde a cada dato GPS
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* JSON Preview */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">JSON recibido</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>

        {/* Field Mapping */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Campos requeridos</h3>

          {requiredFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} *
              </label>
              <select
                value={fieldMapping[field.key as keyof FieldMapping] || ""}
                onChange={(e) =>
                  onFieldMappingChange({
                    ...fieldMapping,
                    [field.key]: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Seleccionar campo...</option>
                {fieldPaths.map((fp: any) => (
                  <option key={fp.path} value={fp.path}>
                    {fp.path} = {JSON.stringify(fp.value).slice(0, 30)}
                  </option>
                ))}
              </select>
              {fieldMapping[field.key as keyof FieldMapping] && (
                <p className="text-xs text-gray-500 mt-1">
                  Valor: {JSON.stringify(getValue(payload, fieldMapping[field.key as keyof FieldMapping] || ""))}
                </p>
              )}
            </div>
          ))}

          <h3 className="font-medium text-gray-900 pt-4">Campos opcionales</h3>

          {optionalFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <select
                value={fieldMapping[field.key as keyof FieldMapping] || ""}
                onChange={(e) =>
                  onFieldMappingChange({
                    ...fieldMapping,
                    [field.key]: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">No usar</option>
                {fieldPaths.map((fp: any) => (
                  <option key={fp.path} value={fp.path}>
                    {fp.path} = {JSON.stringify(fp.value).slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Device ID validation */}
          {fieldMapping.deviceIdField && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Device ID detectado:{" "}
                <code className="font-mono bg-gray-200 px-1 rounded">
                  {String(getValue(payload, fieldMapping.deviceIdField))}
                </code>
              </p>
              {String(getValue(payload, fieldMapping.deviceIdField)) !== deviceId && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Este valor no coincide con el ID configurado ({deviceId})
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar y continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// STEP 3: TEST
// ============================================

function TestStep({
  device,
  fieldMapping,
  samples,
  testResult,
  onTest,
  onSelectSample,
  selectedSampleId,
  onBack,
  onActivate,
}: {
  device: any;
  fieldMapping: FieldMapping;
  samples: any[];
  testResult: any;
  onTest: () => void;
  onSelectSample: (id: Id<"gpsWebhookSamples">) => void;
  selectedSampleId: Id<"gpsWebhookSamples"> | null;
  onBack: () => void;
  onActivate: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Probar configuración</h2>
        <p className="text-gray-600 mt-1">
          Verifica que los datos se extraen correctamente antes de activar el dispositivo
        </p>
      </div>

      {/* Field Mapping Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Configuración actual</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Latitud: <code className="bg-gray-200 px-1 rounded">{fieldMapping.latitude}</code></div>
          <div>Longitud: <code className="bg-gray-200 px-1 rounded">{fieldMapping.longitude}</code></div>
          <div>Device ID: <code className="bg-gray-200 px-1 rounded">{fieldMapping.deviceIdField}</code></div>
          {fieldMapping.speed && <div>Velocidad: <code className="bg-gray-200 px-1 rounded">{fieldMapping.speed}</code></div>}
          {fieldMapping.heading && <div>Rumbo: <code className="bg-gray-200 px-1 rounded">{fieldMapping.heading}</code></div>}
          {fieldMapping.timestamp && <div>Timestamp: <code className="bg-gray-200 px-1 rounded">{fieldMapping.timestamp}</code></div>}
        </div>
      </div>

      {/* Select Sample */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar sample para probar
        </label>
        <select
          value={selectedSampleId || ""}
          onChange={(e) => onSelectSample(e.target.value as Id<"gpsWebhookSamples">)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Seleccionar...</option>
          {samples.map((sample) => (
            <option key={sample._id} value={sample._id}>
              {new Date(sample.receivedAt).toLocaleTimeString()} - {sample.rawPayload.slice(0, 50)}...
            </option>
          ))}
        </select>
      </div>

      {/* Test Button */}
      <button
        onClick={onTest}
        disabled={!selectedSampleId}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <RefreshCw className="w-4 h-4" />
        Probar mapeo
      </button>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
              {testResult.success ? "Prueba exitosa" : "Errores encontrados"}
            </span>
          </div>

          {testResult.success && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Latitud: <strong>{testResult.latitude}</strong></div>
              <div>Longitud: <strong>{testResult.longitude}</strong></div>
              <div>Device ID: <strong>{testResult.deviceId}</strong></div>
              {testResult.speed !== undefined && <div>Velocidad: <strong>{testResult.speed}</strong></div>}
              {testResult.heading !== undefined && <div>Rumbo: <strong>{testResult.heading}</strong></div>}
            </div>
          )}

          {testResult.errors.length > 0 && (
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {testResult.errors.map((err: string, i: number) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Editar mapeo
        </button>
        <button
          onClick={onActivate}
          disabled={!testResult?.success}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Activar dispositivo
        </button>
      </div>
    </div>
  );
}

// ============================================
// STEP 4: ASSIGN VEHICLE
// ============================================

function AssignVehicleStep({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAssign,
  onSkip,
  currentVehicle,
}: {
  vehicles: any[];
  selectedVehicleId: Id<"vehicles"> | null;
  onSelectVehicle: (id: Id<"vehicles"> | null) => void;
  onAssign: () => void;
  onSkip: () => void;
  currentVehicle: any;
}) {
  // Filter out vehicles that already have this device or another device assigned
  const availableVehicles = vehicles.filter(
    (v) => v.gpsSourceType !== "device" || v._id === currentVehicle?.id
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Dispositivo activado</h2>
        <p className="text-gray-600 mt-1">
          Ahora puedes asignar el dispositivo a un vehículo
        </p>
      </div>

      {currentVehicle && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Actualmente asignado a: <strong>{currentVehicle.licensePlate}</strong> ({currentVehicle.brand} {currentVehicle.model})
          </p>
        </div>
      )}

      {/* Vehicle Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar vehículo
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedVehicleId === vehicle._id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onSelectVehicle(vehicle._id)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedVehicleId === vehicle._id ? "bg-primary/20" : "bg-gray-100"
              }`}>
                <Truck className={`w-5 h-5 ${selectedVehicleId === vehicle._id ? "text-primary" : "text-gray-500"}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{vehicle.licensePlate}</p>
                <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</p>
              </div>
              {selectedVehicleId === vehicle._id && (
                <Check className="w-5 h-5 text-primary ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Omitir por ahora
        </button>
        <button
          onClick={onAssign}
          disabled={!selectedVehicleId}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Asignar a vehículo
        </button>
      </div>
    </div>
  );
}
