import { Truck, Users, Wrench } from 'lucide-react';
import type { Vehicle } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatPlate } from '@/lib/utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Mi Vehículo</h3>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      {/* Vehicle Info */}
      <div className="space-y-3">
        {/* Model & Plate */}
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-sm text-gray-600">
            Placa: <span className="font-medium">{formatPlate(vehicle.plate)}</span>
          </p>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Capacidad: {vehicle.capacity} pasajeros</span>
        </div>

        {/* Year & Color */}
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Año: {vehicle.year}</span>
          <span>Color: {vehicle.color}</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Wrench className="w-4 h-4" />
        Ver detalles
      </button>
    </div>
  );
}
