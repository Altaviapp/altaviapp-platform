"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
  Bus,
  Users,
  MapPin,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const stats = [
  { name: "Vehículos Activos", value: "12", icon: Bus, color: "bg-blue-500" },
  { name: "Estudiantes", value: "324", icon: GraduationCap, color: "bg-green-500" },
  { name: "Rutas", value: "8", icon: MapPin, color: "bg-purple-500" },
  { name: "Personal", value: "24", icon: Users, color: "bg-orange-500" },
];

const recentActivity = [
  { id: 1, type: "success", message: "Ruta AM-01 completada", time: "Hace 5 min" },
  { id: 2, type: "warning", message: "Vehículo BUS-003 reportó retraso", time: "Hace 15 min" },
  { id: 3, type: "success", message: "Check-in: 45 estudiantes en Ruta AM-02", time: "Hace 20 min" },
  { id: 4, type: "info", message: "Conductor Carlos García inició turno", time: "Hace 30 min" },
];

const activeTrips = [
  { id: 1, route: "Ruta AM-01", driver: "Juan Pérez", vehicle: "BUS-001", progress: 75, students: "23/25" },
  { id: 2, route: "Ruta AM-02", driver: "María López", vehicle: "BUS-002", progress: 45, students: "18/22" },
  { id: 3, route: "Ruta AM-03", driver: "Carlos García", vehicle: "BUS-003", progress: 20, students: "12/28" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-500">
          Panel de control de tu institución
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-4 flex items-center"
          >
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Trips */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Viajes Activos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activeTrips.map((trip) => (
              <div key={trip.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{trip.route}</p>
                    <p className="text-sm text-gray-500">
                      {trip.driver} • {trip.vehicle}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {trip.students}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${trip.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{trip.progress}% completado</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-100"
                      : activity.type === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {activity.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : activity.type === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Bus className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-gray-900">Agregar Vehículo</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <GraduationCap className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-gray-900">Registrar Estudiante</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MapPin className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-gray-900">Crear Ruta</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-gray-900">Invitar Usuario</p>
          </button>
        </div>
      </div>
    </div>
  );
}
