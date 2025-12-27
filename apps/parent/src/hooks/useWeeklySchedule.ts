"use client";

/**
 * Hook to get weekly schedule for all parent's children
 *
 * Aggregates route assignments and displays them by day of the week.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";
import { useMyStudents } from "./useMyStudents";
import { Id } from "../../../../convex/_generated/dataModel";

interface RouteAssignment {
  _id: Id<"studentRoutes">;
  routeId: Id<"routes">;
  stopId: Id<"routeStops">;
  route: {
    id: Id<"routes">;
    name: string;
    type: "pickup" | "dropoff";
    scheduledStartTime?: string;
    recurrence?: {
      type: "weekly" | "daily" | "one_time" | "monthly";
      daysOfWeek?: string[];
      dayOfWeek?: string;
    };
  } | null;
  stop: {
    id: Id<"routeStops">;
    name: string;
    scheduledTime?: string;
  } | null;
  excludeDays?: string[];
}

interface ScheduledTrip {
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string | null;
  routeId: Id<"routes">;
  routeName: string;
  routeType: "pickup" | "dropoff";
  stopName: string;
  scheduledTime: string;
  stopId: Id<"routeStops">;
}

interface DaySchedule {
  dayName: string;
  dayLabel: string;
  trips: ScheduledTrip[];
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "Domingo",
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
};

export function useWeeklySchedule() {
  const { userId } = useConvexAuth();
  const { students, isLoading: studentsLoading } = useMyStudents();

  // For each student, get their route assignments
  // We'll query one at a time and aggregate
  const firstStudent = students[0];
  const secondStudent = students[1];
  const thirdStudent = students[2];

  const firstAssignments = useQuery(
    api.studentRoutes.getStudentAssignments,
    userId && firstStudent ? { userId, studentId: firstStudent._id } : "skip"
  );

  const secondAssignments = useQuery(
    api.studentRoutes.getStudentAssignments,
    userId && secondStudent ? { userId, studentId: secondStudent._id } : "skip"
  );

  const thirdAssignments = useQuery(
    api.studentRoutes.getStudentAssignments,
    userId && thirdStudent ? { userId, studentId: thirdStudent._id } : "skip"
  );

  const isLoading =
    studentsLoading ||
    (firstStudent && firstAssignments === undefined) ||
    (secondStudent && secondAssignments === undefined) ||
    (thirdStudent && thirdAssignments === undefined);

  // Aggregate all assignments with student info
  const allAssignments: Array<{ student: NonNullable<typeof firstStudent>; assignments: RouteAssignment[] }> = [];

  if (firstStudent && firstAssignments) {
    allAssignments.push({ student: firstStudent, assignments: firstAssignments as RouteAssignment[] });
  }
  if (secondStudent && secondAssignments) {
    allAssignments.push({ student: secondStudent, assignments: secondAssignments as RouteAssignment[] });
  }
  if (thirdStudent && thirdAssignments) {
    allAssignments.push({ student: thirdStudent, assignments: thirdAssignments as RouteAssignment[] });
  }

  // Build weekly schedule
  const weeklySchedule: DaySchedule[] = DAY_NAMES.map((dayName) => {
    const trips: ScheduledTrip[] = [];

    for (const { student, assignments } of allAssignments) {
      for (const assignment of assignments) {
        if (!assignment.route || !assignment.stop) continue;

        // Check if route runs on this day
        const route = assignment.route;
        const recurrence = route.recurrence;
        const excludeDays = assignment.excludeDays ?? [];

        // Check if student excludes this day
        if (excludeDays.includes(dayName)) continue;

        // Check recurrence
        let runsOnDay = true;
        if (recurrence) {
          if (recurrence.type === "weekly" && recurrence.daysOfWeek) {
            runsOnDay = recurrence.daysOfWeek.includes(dayName);
          } else if (recurrence.type === "daily") {
            runsOnDay = true;
          } else if (recurrence.type === "one_time") {
            runsOnDay = false; // One-time routes don't repeat
          }
        }

        if (!runsOnDay) continue;

        trips.push({
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentPhoto: (student as { photoUrl?: string | null }).photoUrl,
          routeId: route.id,
          routeName: route.name,
          routeType: route.type,
          stopName: assignment.stop.name,
          scheduledTime: assignment.stop.scheduledTime ?? route.scheduledStartTime ?? "00:00",
          stopId: assignment.stop.id,
        });
      }
    }

    // Sort by scheduled time
    trips.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    return {
      dayName,
      dayLabel: DAY_LABELS[dayName] ?? dayName,
      trips,
    };
  });

  // Filter to only weekdays (Monday-Friday) by default
  const weekdaySchedule = weeklySchedule.filter((day) =>
    ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.dayName)
  );

  return {
    weeklySchedule,
    weekdaySchedule,
    isLoading,
    hasSchedule: weekdaySchedule.some((day) => day.trips.length > 0),
  };
}
