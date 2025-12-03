"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
  MapPin,
  Clock,
  CheckCircle,
  Bus,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const students = [
  {
    id: 1,
    name: "María García",
    grade: "5to Grado",
    photo: null,
    status: "in_transit",
    route: "Ruta AM-01",
    nextStop: "Av. República",
    eta: "8:15 AM",
  },
  {
    id: 2,
    name: "Carlos García",
    grade: "3ro Grado",
    photo: null,
    status: "at_school",
    route: "Ruta AM-01",
    nextStop: null,
    eta: null,
  },
];

const recentActivity = [
  { id: 1, student: "María García", action: "Subió al bus", time: "7:45 AM", type: "pickup" },
  { id: 2, student: "Carlos García", action: "Llegó a la escuela", time: "8:05 AM", type: "dropoff" },
  { id: 3, student: "María García", action: "Próxima parada: Av. República", time: "8:10 AM", type: "eta" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-bold text-gray-900">
          Hola, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm">
          Seguimiento de tus hijos en tiempo real
        </p>
      </div>

      {/* Students */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mis Hijos</h2>
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/tracking?student=${student.id}`}
              className="block bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.grade}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {student.status === "in_transit" && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Bus className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">En camino</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {student.nextStop}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      ETA: {student.eta}
                    </div>
                  </div>
                </div>
              )}

              {student.status === "at_school" && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">En la escuela</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Actividad Reciente</h2>
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-center">
              <div
                className={`p-2 rounded-full ${
                  activity.type === "pickup"
                    ? "bg-blue-100"
                    : activity.type === "dropoff"
                    ? "bg-green-100"
                    : "bg-yellow-100"
                }`}
              >
                {activity.type === "pickup" ? (
                  <Bus className="h-4 w-4 text-blue-600" />
                ) : activity.type === "dropoff" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/tracking"
          className="bg-primary text-white rounded-lg p-4 flex flex-col items-center"
        >
          <MapPin className="h-8 w-8 mb-2" />
          <span className="font-medium">Ver en Mapa</span>
        </Link>
        <Link
          href="/history"
          className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center"
        >
          <Clock className="h-8 w-8 mb-2 text-gray-600" />
          <span className="font-medium text-gray-900">Historial</span>
        </Link>
      </div>
    </div>
  );
}
