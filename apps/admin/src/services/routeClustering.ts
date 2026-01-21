/**
 * Route Clustering Service
 *
 * Clusters students into route groups by geographic proximity for the bulk
 * route creation wizard. Uses k-means clustering to group students and
 * respects vehicle capacity constraints.
 */

import { calculateHaversineDistance, type LatLng } from "@altaviapp/maps";

/**
 * Input student for clustering
 */
export type ClusteringStudent = {
  id: string;
  name: string;
  position: LatLng;
  address?: string;
};

/**
 * Vehicle with capacity for clustering
 */
export type ClusteringVehicle = {
  id: string;
  capacity: number;
};

/**
 * A stop represents a pickup/dropoff point that may serve multiple students
 */
export type ClusterStop = {
  id: string;
  position: LatLng;
  studentIds: string[];
};

/**
 * Result cluster representing one route's worth of students
 */
export type StudentCluster = {
  vehicleId: string;
  vehicleCapacity: number;
  students: ClusteringStudent[];
  stops: ClusterStop[];
};

/**
 * Result of the clustering operation
 */
export type ClusteringResult = {
  /** Successfully clustered routes */
  clusters: StudentCluster[];
  /** Students that couldn't be assigned due to capacity limits */
  unassignedStudents: ClusteringStudent[];
  /** Students without GPS coordinates (skipped) */
  studentsWithoutGps: ClusteringStudent[];
  /** Total students processed */
  totalStudents: number;
  /** Total capacity available */
  totalCapacity: number;
};

/**
 * Clustering configuration options
 */
export type ClusteringOptions = {
  /** Radius in meters within which students share a stop (default: 100) */
  groupingRadius?: number;
  /** Maximum iterations for k-means convergence (default: 100) */
  maxIterations?: number;
  /** Minimum centroid movement to continue iterations (default: 1 meter) */
  convergenceThreshold?: number;
};

/**
 * Cluster students into route groups by geographic proximity
 *
 * This function:
 * 1. Filters out students without valid GPS coordinates
 * 2. Uses k-means clustering to group students geographically
 * 3. Assigns clusters to vehicles respecting capacity limits
 * 4. Groups nearby students into shared stops based on groupingRadius
 *
 * @param students - Array of students with coordinates
 * @param vehicles - Array of vehicles with capacity
 * @param schoolLocation - School coordinates (used as reference point)
 * @param options - Optional clustering parameters
 * @returns Clustering result with assigned clusters and unassigned students
 */
export function clusterStudentsForRoutes(
  students: ClusteringStudent[],
  vehicles: ClusteringVehicle[],
  schoolLocation: LatLng,
  options: ClusteringOptions = {}
): ClusteringResult {
  const {
    groupingRadius = 100,
    maxIterations = 100,
    convergenceThreshold = 1,
  } = options;

  // Separate students with and without GPS
  const studentsWithGps: ClusteringStudent[] = [];
  const studentsWithoutGps: ClusteringStudent[] = [];

  for (const student of students) {
    if (hasValidCoordinates(student.position)) {
      studentsWithGps.push(student);
    } else {
      studentsWithoutGps.push(student);
    }
  }

  // Calculate total capacity
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
  const numClusters = vehicles.length;

  // Handle edge cases
  if (studentsWithGps.length === 0 || numClusters === 0) {
    return {
      clusters: [],
      unassignedStudents: [],
      studentsWithoutGps,
      totalStudents: students.length,
      totalCapacity,
    };
  }

  // Run k-means clustering
  const clusterAssignments = kMeansClustering(
    studentsWithGps,
    numClusters,
    schoolLocation,
    maxIterations,
    convergenceThreshold
  );

  // Sort vehicles by capacity (largest first) for better distribution
  const sortedVehicles = [...vehicles].sort((a, b) => b.capacity - a.capacity);

  // Collect students per cluster
  const studentsByCluster: Map<number, ClusteringStudent[]> = new Map();
  for (let i = 0; i < numClusters; i++) {
    studentsByCluster.set(i, []);
  }

  for (let i = 0; i < studentsWithGps.length; i++) {
    const clusterIndex = clusterAssignments[i] ?? 0;
    const student = studentsWithGps[i];
    if (student) {
      studentsByCluster.get(clusterIndex)?.push(student);
    }
  }

  // Balance clusters by reassigning excess students
  const balancedClusters = balanceClustersByCapacity(
    studentsByCluster,
    sortedVehicles,
    schoolLocation
  );

  // Build result clusters with stops
  const clusters: StudentCluster[] = [];
  const unassignedStudents: ClusteringStudent[] = [];

  for (let i = 0; i < sortedVehicles.length; i++) {
    const vehicle = sortedVehicles[i];
    if (!vehicle) continue;

    const clusterStudents = balancedClusters.get(i) ?? [];

    // Take only up to vehicle capacity
    const assignedStudents = clusterStudents.slice(0, vehicle.capacity);
    const overflow = clusterStudents.slice(vehicle.capacity);

    // Add overflow to unassigned
    unassignedStudents.push(...overflow);

    if (assignedStudents.length > 0) {
      // Group students into stops based on proximity
      const stops = groupStudentsIntoStops(assignedStudents, groupingRadius);

      clusters.push({
        vehicleId: vehicle.id,
        vehicleCapacity: vehicle.capacity,
        students: assignedStudents,
        stops,
      });
    }
  }

  return {
    clusters,
    unassignedStudents,
    studentsWithoutGps,
    totalStudents: students.length,
    totalCapacity,
  };
}

/**
 * Check if coordinates are valid (non-zero and within valid ranges)
 */
function hasValidCoordinates(position: LatLng): boolean {
  return (
    position.lat !== 0 &&
    position.lng !== 0 &&
    position.lat >= -90 &&
    position.lat <= 90 &&
    position.lng >= -180 &&
    position.lng <= 180
  );
}

/**
 * K-means clustering algorithm for geographic points
 *
 * @param students - Students to cluster
 * @param k - Number of clusters
 * @param referencePoint - Reference point for initial centroid placement
 * @param maxIterations - Maximum iterations
 * @param threshold - Convergence threshold in meters
 * @returns Array of cluster indices (one per student)
 */
function kMeansClustering(
  students: ClusteringStudent[],
  k: number,
  referencePoint: LatLng,
  maxIterations: number,
  threshold: number
): number[] {
  const n = students.length;

  // Handle special cases
  if (n <= k) {
    // Each student gets their own cluster
    return students.map((_, i) => i % k);
  }

  // Initialize centroids using k-means++ for better initial placement
  let centroids = initializeCentroidsKMeansPlusPlus(students, k, referencePoint);
  let assignments = new Array<number>(n).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assignment step: assign each student to nearest centroid
    const newAssignments: number[] = [];
    for (const student of students) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let c = 0; c < k; c++) {
        const centroid = centroids[c];
        if (!centroid) continue;
        const dist = calculateHaversineDistance(student.position, centroid);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = c;
        }
      }
      newAssignments.push(nearestCluster);
    }

    // Update step: recalculate centroids
    const newCentroids = calculateCentroids(students, newAssignments, k);

    // Check for convergence
    let maxMovement = 0;
    for (let c = 0; c < k; c++) {
      const oldCentroid = centroids[c];
      const newCentroid = newCentroids[c];
      if (oldCentroid && newCentroid) {
        const movement = calculateHaversineDistance(oldCentroid, newCentroid);
        maxMovement = Math.max(maxMovement, movement);
      }
    }

    centroids = newCentroids;
    assignments = newAssignments;

    // Converged if max movement is below threshold
    if (maxMovement < threshold) {
      break;
    }
  }

  return assignments;
}

/**
 * Initialize centroids using k-means++ algorithm for better clustering
 */
function initializeCentroidsKMeansPlusPlus(
  students: ClusteringStudent[],
  k: number,
  referencePoint: LatLng
): LatLng[] {
  const centroids: LatLng[] = [];

  // First centroid: choose the student furthest from reference point
  // This ensures good spread from the school
  let maxDist = -1;
  let firstCentroid: LatLng = students[0]?.position ?? referencePoint;

  for (const student of students) {
    const dist = calculateHaversineDistance(student.position, referencePoint);
    if (dist > maxDist) {
      maxDist = dist;
      firstCentroid = student.position;
    }
  }
  centroids.push(firstCentroid);

  // Remaining centroids: k-means++ (probabilistically choose based on distance)
  while (centroids.length < k) {
    const distances: number[] = [];
    let totalDist = 0;

    // Calculate distance to nearest existing centroid for each student
    for (const student of students) {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = calculateHaversineDistance(student.position, centroid);
        minDist = Math.min(minDist, dist);
      }
      // Use squared distance for weighting (farther points more likely to be chosen)
      const squaredDist = minDist * minDist;
      distances.push(squaredDist);
      totalDist += squaredDist;
    }

    // Choose next centroid with probability proportional to squared distance
    if (totalDist === 0) {
      // All students are at centroid positions, pick randomly
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      if (randomStudent) {
        centroids.push(randomStudent.position);
      }
    } else {
      let threshold = Math.random() * totalDist;
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const dist = distances[i];
        if (student && dist !== undefined) {
          threshold -= dist;
          if (threshold <= 0) {
            centroids.push(student.position);
            break;
          }
        }
      }
      // Fallback if we didn't select (shouldn't happen)
      if (centroids.length < k - (k - centroids.length - 1)) {
        const lastStudent = students[students.length - 1];
        if (lastStudent) {
          centroids.push(lastStudent.position);
        }
      }
    }
  }

  return centroids;
}

/**
 * Calculate new centroids based on current assignments
 */
function calculateCentroids(
  students: ClusteringStudent[],
  assignments: number[],
  k: number
): LatLng[] {
  const centroids: LatLng[] = [];

  for (let c = 0; c < k; c++) {
    const clusterStudents = students.filter((_, i) => assignments[i] === c);

    if (clusterStudents.length === 0) {
      // Empty cluster: keep a default position
      centroids.push({ lat: 0, lng: 0 });
    } else {
      // Calculate mean position
      let sumLat = 0;
      let sumLng = 0;
      for (const student of clusterStudents) {
        sumLat += student.position.lat;
        sumLng += student.position.lng;
      }
      centroids.push({
        lat: sumLat / clusterStudents.length,
        lng: sumLng / clusterStudents.length,
      });
    }
  }

  return centroids;
}

/**
 * Balance clusters by reassigning students from over-capacity clusters
 * to nearby under-capacity clusters
 */
function balanceClustersByCapacity(
  studentsByCluster: Map<number, ClusteringStudent[]>,
  vehicles: ClusteringVehicle[],
  _schoolLocation: LatLng
): Map<number, ClusteringStudent[]> {
  // Create working copy
  const balanced = new Map<number, ClusteringStudent[]>();
  studentsByCluster.forEach((value, key) => {
    balanced.set(key, [...value]);
  });

  // Identify over and under capacity clusters
  const overCapacity: Array<{ index: number; excess: number }> = [];
  const underCapacity: Array<{ index: number; available: number }> = [];

  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i];
    if (!vehicle) continue;

    const clusterSize = balanced.get(i)?.length ?? 0;
    const capacity = vehicle.capacity;

    if (clusterSize > capacity) {
      overCapacity.push({ index: i, excess: clusterSize - capacity });
    } else if (clusterSize < capacity) {
      underCapacity.push({ index: i, available: capacity - clusterSize });
    }
  }

  // Reassign excess students to clusters with available capacity
  for (const over of overCapacity) {
    const overClusterStudents = balanced.get(over.index) ?? [];

    // Calculate centroid of under-capacity clusters
    for (const under of underCapacity) {
      if (under.available <= 0) continue;

      const underClusterStudents = balanced.get(under.index) ?? [];

      // Find students in over-capacity cluster closest to under-capacity cluster centroid
      const underCentroid = calculateClusterCentroid(underClusterStudents);

      // Sort by distance to under-capacity cluster
      const sortedStudents = [...overClusterStudents].sort((a, b) => {
        const distA = calculateHaversineDistance(a.position, underCentroid);
        const distB = calculateHaversineDistance(b.position, underCentroid);
        return distA - distB;
      });

      // Move students until capacity is met or no more excess
      const overCapacityVehicle = vehicles[over.index];
      const targetSize = overCapacityVehicle?.capacity ?? 0;

      while (
        overClusterStudents.length > targetSize &&
        under.available > 0 &&
        sortedStudents.length > 0
      ) {
        // Find the closest student to move
        const studentToMove = sortedStudents.shift();
        if (!studentToMove) break;

        // Remove from over-capacity cluster
        const index = overClusterStudents.findIndex((s) => s.id === studentToMove.id);
        if (index !== -1) {
          overClusterStudents.splice(index, 1);

          // Add to under-capacity cluster
          underClusterStudents.push(studentToMove);
          under.available--;
        }
      }

      balanced.set(under.index, underClusterStudents);
    }

    balanced.set(over.index, overClusterStudents);
  }

  return balanced;
}

/**
 * Calculate the centroid (center point) of a cluster
 */
function calculateClusterCentroid(students: ClusteringStudent[]): LatLng {
  if (students.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const student of students) {
    sumLat += student.position.lat;
    sumLng += student.position.lng;
  }

  return {
    lat: sumLat / students.length,
    lng: sumLng / students.length,
  };
}

/**
 * Group students into stops based on proximity
 * Students within groupingRadius of each other share a stop
 */
function groupStudentsIntoStops(
  students: ClusteringStudent[],
  groupingRadius: number
): ClusterStop[] {
  const stops: ClusterStop[] = [];
  const assigned = new Set<string>();

  // Sort students by position for consistent results
  const sortedStudents = [...students].sort((a, b) => {
    if (a.position.lat !== b.position.lat) {
      return a.position.lat - b.position.lat;
    }
    return a.position.lng - b.position.lng;
  });

  for (const student of sortedStudents) {
    if (assigned.has(student.id)) continue;

    // Find all students within groupingRadius
    const nearbyStudentIds: string[] = [student.id];
    assigned.add(student.id);

    for (const other of sortedStudents) {
      if (assigned.has(other.id)) continue;

      const distance = calculateHaversineDistance(student.position, other.position);
      if (distance <= groupingRadius) {
        nearbyStudentIds.push(other.id);
        assigned.add(other.id);
      }
    }

    // Create stop at first student's position (or could calculate centroid)
    stops.push({
      id: `stop-${stops.length + 1}`,
      position: student.position,
      studentIds: nearbyStudentIds,
    });
  }

  return stops;
}

/**
 * Re-export useful functions and types
 */
export { calculateHaversineDistance } from "@altaviapp/maps";
export type { LatLng } from "@altaviapp/maps";
