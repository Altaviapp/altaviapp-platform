"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { useConvexAuth } from "@/hooks/useConvexAuth";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Satellite,
  Truck,
  User,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface DeviceAssignment {
  _id: Id<"gpsDeviceAssignments">;
  deviceId: Id<"gpsDevices">;
  vehicleId: Id<"vehicles">;
  institutionId: Id<"institutions">;
  assignedAt: number;
  unassignedAt?: number;
  assignedBy: Id<"users">;
  unassignedBy?: Id<"users">;
  reason?: string;
  vehicle: {
    id: Id<"vehicles">;
    licensePlate: string;
    brand: string;
    model: string;
  } | null;
  assignedByName: string;
  unassignedByName: string | null;
}

export default function DeviceHistoryPage() {
  const params = useParams();
  const { userId } = useConvexAuth();
  const deviceId = params.id as Id<"gpsDevices">;

  const device = useQuery(
    api.gpsDevices.getDevice,
    userId && deviceId ? { userId, deviceId } : "skip"
  );

  const history = useQuery(
    api.gpsDevices.getDeviceAssignmentHistory,
    userId && deviceId ? { userId, deviceId } : "skip"
  ) as DeviceAssignment[] | undefined;

  if (!device) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Historial: ${device.name}`}
        subtitle={`ID: ${device.deviceId}`}
        backHref="/fleet/gps-devices"
      />

      {/* Current Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Asignación Actual</h3>
        {device.vehicle ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{device.vehicle.licensePlate}</p>
              <p className="text-sm text-gray-500">
                {device.vehicle.brand} {device.vehicle.model} - {device.vehicle.color}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Sin asignar a ningún vehículo</p>
        )}
      </div>

      {/* Assignment History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Historial de Asignaciones</h3>

        {!history || history.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            No hay historial de asignaciones
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((assignment, index) => (
              <div
                key={assignment._id}
                className={`relative pl-8 pb-6 ${
                  index < history.length - 1 ? "border-l-2 border-gray-200" : ""
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 w-4 h-4 rounded-full -translate-x-1/2 ${
                    !assignment.unassignedAt
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />

                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Vehicle Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignment.vehicle?.licensePlate || "Vehículo desconocido"}
                      </p>
                      {assignment.vehicle && (
                        <p className="text-sm text-gray-500">
                          {assignment.vehicle.brand} {assignment.vehicle.model}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Asignado</p>
                        <p className="text-gray-900">{formatDate(assignment.assignedAt)}</p>
                      </div>
                    </div>

                    {assignment.unassignedAt && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-500">Desasignado</p>
                          <p className="text-gray-900">{formatDate(assignment.unassignedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Users */}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Asignado por: {assignment.assignedByName}</span>
                    </div>
                    {assignment.unassignedByName && (
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <User className="w-4 h-4" />
                        <span>Desasignado por: {assignment.unassignedByName}</span>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  {assignment.reason && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Razón: </span>
                      <span className="text-gray-700">{assignment.reason}</span>
                    </div>
                  )}

                  {/* Status badge */}
                  {!assignment.unassignedAt && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Asignación activa
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
