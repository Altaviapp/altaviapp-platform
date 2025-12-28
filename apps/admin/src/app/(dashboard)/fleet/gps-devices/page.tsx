"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useConvexAuth } from "@/hooks/useConvexAuth";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Satellite,
  Plus,
  Settings,
  History,
  Truck,
  Signal,
  SignalZero,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

type DeviceStatus = "pending_config" | "testing" | "active" | "inactive";

interface GPSDevice {
  _id: Id<"gpsDevices">;
  institutionId: Id<"institutions">;
  deviceId: string;
  name: string;
  status: DeviceStatus;
  fieldMapping?: {
    latitude: string;
    longitude: string;
    speed?: string;
    heading?: string;
    timestamp?: string;
    deviceIdField: string;
  };
  vehicleId?: Id<"vehicles">;
  lastSeen?: number;
  lastPayloadSample?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  vehicle?: {
    id: Id<"vehicles">;
    licensePlate: string;
    brand: string;
    model: string;
  } | null;
  lastSeenAgo?: number | null;
}

export default function GPSDevicesPage() {
  const { userId, user } = useConvexAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const institutionId = user?.institutionId as Id<"institutions"> | undefined;

  const devices = useQuery(
    api.gpsDevices.listDevices,
    userId && institutionId
      ? { userId, institutionId, includeInactive: false }
      : "skip"
  ) as GPSDevice[] | undefined;

  const institution = useQuery(
    api.institutions.getInstitution,
    userId && institutionId
      ? { userId, institutionId }
      : "skip"
  );

  const copyToken = async () => {
    if (institution?.apiToken) {
      await navigator.clipboard.writeText(institution.apiToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    const styles = {
      pending_config: "bg-yellow-100 text-yellow-800",
      testing: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    const labels = {
      pending_config: "Sin configurar",
      testing: "En pruebas",
      active: "Activo",
      inactive: "Inactivo",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatLastSeen = (secondsAgo: number | null | undefined) => {
    if (secondsAgo === null || secondsAgo === undefined) {
      return "Nunca";
    }
    if (secondsAgo < 60) {
      return "Hace segundos";
    }
    if (secondsAgo < 3600) {
      const mins = Math.floor(secondsAgo / 60);
      return `Hace ${mins} min`;
    }
    if (secondsAgo < 86400) {
      const hours = Math.floor(secondsAgo / 3600);
      return `Hace ${hours}h`;
    }
    const days = Math.floor(secondsAgo / 86400);
    return `Hace ${days}d`;
  };

  const getSignalStatus = (lastSeenAgo: number | null | undefined) => {
    if (lastSeenAgo === null || lastSeenAgo === undefined) {
      return { icon: SignalZero, color: "text-gray-400", label: "Sin señal" };
    }
    if (lastSeenAgo < 120) {
      return { icon: Signal, color: "text-green-500", label: "En línea" };
    }
    if (lastSeenAgo < 600) {
      return { icon: Signal, color: "text-yellow-500", label: "Intermitente" };
    }
    return { icon: SignalZero, color: "text-red-500", label: "Desconectado" };
  };

  if (!userId || !institutionId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispositivos GPS"
        subtitle="Gestiona los dispositivos GPS externos de tu flota"
        actions={[
          {
            label: "Agregar Dispositivo",
            onClick: () => setShowCreateModal(true),
            icon: Plus,
            variant: "primary",
          },
        ]}
      />

      {/* API Token Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Token de API para dispositivos GPS</h3>
            <p className="text-sm text-blue-700 mt-1">
              Los dispositivos GPS externos necesitan este token para autenticarse al enviar datos.
            </p>
            {institution?.apiToken ? (
              <div className="mt-3 flex items-center gap-2">
                <code className="px-3 py-1.5 bg-white border border-blue-200 rounded text-sm font-mono">
                  {institution.apiToken.slice(0, 20)}...
                </code>
                <button
                  onClick={copyToken}
                  className="p-2 hover:bg-blue-100 rounded transition-colors"
                  title="Copiar token"
                >
                  {copiedToken ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-blue-600">
                No hay token configurado. Contacta al administrador.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Endpoints Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-3">Endpoints para dispositivos GPS</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">SANDBOX</span>
            <code className="text-gray-600">POST {process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site')}/gps/sandbox</code>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">PRODUCCIÓN</span>
            <code className="text-gray-600">POST {process.env.NEXT_PUBLIC_CONVEX_URL?.replace('.cloud', '.site')}/gps/device/v2</code>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Header requerido: <code>X-Institution-Token: {"<token>"}</code>
        </p>
      </div>

      {/* Devices List */}
      {devices === undefined ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Satellite className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay dispositivos GPS registrados
          </h3>
          <p className="text-gray-500 mb-6">
            Agrega un dispositivo GPS para comenzar a recibir datos de ubicación de tus vehículos.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Dispositivo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo Asignado
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Señal
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map((device) => {
                const signal = getSignalStatus(device.lastSeenAgo);
                const SignalIcon = signal.icon;

                return (
                  <tr key={device._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Satellite className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{device.name}</p>
                          <p className="text-sm text-gray-500">ID: {device.deviceId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(device.status)}
                    </td>
                    <td className="px-6 py-4">
                      {device.vehicle ? (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{device.vehicle.licensePlate}</span>
                          <span className="text-gray-500 text-sm">
                            {device.vehicle.brand} {device.vehicle.model}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <SignalIcon className={`w-4 h-4 ${signal.color}`} />
                        <span className="text-sm text-gray-600">
                          {formatLastSeen(device.lastSeenAgo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/fleet/gps-devices/${device._id}/configure`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Configurar"
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                        </Link>
                        <Link
                          href={`/fleet/gps-devices/${device._id}/history`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Historial"
                        >
                          <History className="w-4 h-4 text-gray-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Device Modal */}
      {showCreateModal && institutionId && userId && (
        <CreateDeviceModal
          institutionId={institutionId}
          userId={userId}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

// ============================================
// CREATE DEVICE MODAL
// ============================================

function CreateDeviceModal({
  institutionId,
  userId,
  onClose,
}: {
  institutionId: Id<"institutions">;
  userId: Id<"users">;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createDevice = useMutation(api.gpsDevices.createDevice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!deviceId.trim()) {
      setError("El ID del dispositivo es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDevice({
        userId,
        institutionId,
        name: name.trim(),
        deviceId: deviceId.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear el dispositivo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Agregar Dispositivo GPS</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del dispositivo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: GPS Bus Ruta Norte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Un nombre descriptivo para identificar el dispositivo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del dispositivo *
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Ej: GPS-001 o IMEI del dispositivo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              El identificador único que el dispositivo envía en sus mensajes
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Dispositivo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
