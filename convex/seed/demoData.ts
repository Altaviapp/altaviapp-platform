/**
 * Demo Seed Data - Barrio La Carolina / La Floresta, Quito, Ecuador
 *
 * This data represents a realistic school transport scenario in northern Quito.
 * All coordinates are real locations in the La Carolina / La Floresta area.
 */

// ============================================================================
// CLIENT (Parent Organization)
// ============================================================================
export const DEMO_CLIENT = {
  name: "Transporte Escolar Demo Quito",
  legalName: "Demo Transport S.A.",
  taxId: "1790123456001", // RUC demo
  contactPerson: "María García Mendoza",
  contactEmail: "admin@demo-transport.com",
  contactPhone: "+593998765432",
  address: "Av. Amazonas N36-152 y Naciones Unidas",
  city: "Quito",
  province: "Pichincha",
  country: "EC",
  subscriptionPlan: "professional" as const,
  subscriptionStatus: "active" as const,
  maxInstitutions: 5,
  maxUsers: 50,
  isActive: true,
};

// ============================================================================
// INSTITUTION (School)
// ============================================================================
export const DEMO_INSTITUTION = {
  name: "Colegio Demo La Carolina",
  type: "school" as const,
  address: "Av. de los Shyris N35-174 y Portugal",
  city: "Quito",
  phone: "+593223456789",
  email: "info@colegio-demo.edu.ec",
  contactPerson: "Dr. Roberto Andrade",
  isActive: true,
  subscriptionPlan: "professional" as const,
  subscriptionStatus: "active" as const,
  // School location (destination for pickup routes, origin for dropoff)
  latitude: -0.1828,
  longitude: -78.4847,
};

// ============================================================================
// ADMIN USER
// ============================================================================
export const DEMO_ADMIN = {
  email: "admin@demo.com",
  password: "demo123", // Will be hashed
  name: "Administrador Demo",
  firstName: "Admin",
  lastName: "Demo",
  phone: "+593991000000",
  role: "admin" as const,
};

// ============================================================================
// VEHICLES (2 buses)
// ============================================================================
export const DEMO_VEHICLES = [
  {
    licensePlate: "PBA-1234",
    brand: "Toyota",
    model: "Coaster",
    year: 2022,
    color: "Blanco",
    capacity: 30,
    status: "active" as const,
    isActive: true,
  },
  {
    licensePlate: "PCA-5678",
    brand: "Hino",
    model: "Dutro",
    year: 2021,
    color: "Amarillo",
    capacity: 35,
    status: "active" as const,
    isActive: true,
  },
];

// ============================================================================
// DRIVERS (2 drivers with users)
// ============================================================================
export const DEMO_DRIVERS = [
  {
    user: {
      email: "jperez.driver@demo.com",
      password: "driver123",
      name: "Juan Carlos Pérez",
      firstName: "Juan Carlos",
      lastName: "Pérez",
      phone: "+593991111111",
      role: "driver" as const,
    },
    driver: {
      licenseNumber: "0801234567",
      licenseExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
      phone: "+593991111111",
      emergencyContact: "+593992222222",
      isActive: true,
    },
  },
  {
    user: {
      email: "mrodriguez.driver@demo.com",
      password: "driver123",
      name: "María Elena Rodríguez",
      firstName: "María Elena",
      lastName: "Rodríguez",
      phone: "+593993333333",
      role: "driver" as const,
    },
    driver: {
      licenseNumber: "0807654321",
      licenseExpiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
      phone: "+593993333333",
      emergencyContact: "+593994444444",
      isActive: true,
    },
  },
];

// ============================================================================
// MONITORS (1 monitor with user)
// ============================================================================
export const DEMO_MONITORS = [
  {
    user: {
      email: "atorres.monitor@demo.com",
      password: "monitor123",
      name: "Ana Lucía Torres",
      firstName: "Ana Lucía",
      lastName: "Torres",
      phone: "+593995555555",
      role: "monitor" as const,
    },
    monitor: {
      idNumber: "1712345678",
      phone: "+593995555555",
      emergencyContact: "+593996666666",
      firstAidCertified: true,
      firstAidCertExpiry: Date.now() + 180 * 24 * 60 * 60 * 1000, // 6 months
      childCareCertified: true,
      isActive: true,
    },
  },
];

// ============================================================================
// PARENTS (1 parent user for testing parent app)
// ============================================================================
export const DEMO_PARENTS = [
  {
    user: {
      email: "cmartinez.parent@demo.com",
      password: "parent123",
      name: "Carlos Martínez",
      firstName: "Carlos",
      lastName: "Martínez",
      phone: "+593991234567",
      role: "parent" as const,
    },
    // This parent will be linked to Sofía Martínez Vega
    studentNames: ["Sofía Martínez Vega"],
  },
];

// ============================================================================
// STUDENTS (15 students distributed in La Carolina / La Floresta sector)
// ============================================================================
export const DEMO_STUDENTS = [
  // La Floresta sector (southern part)
  {
    firstName: "Sofía",
    lastName: "Martínez Vega",
    grade: "5to Básica",
    dateOfBirth: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000, // ~10 years old
    address: "Isabel La Católica N24-567, La Floresta",
    homeLatitude: -0.1967,
    homeLongitude: -78.4886,
    parentName: "Carlos Martínez",
    parentPhone: "+593991234567",
    parentEmail: "cmartinez.parent@demo.com", // Must match parent user email!
    emergencyContact: "+593991234568",
  },
  {
    firstName: "Diego",
    lastName: "Sánchez Mora",
    grade: "6to Básica",
    dateOfBirth: Date.now() - 11 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. Coruña E25-123, La Floresta",
    homeLatitude: -0.1985,
    homeLongitude: -78.4912,
    parentName: "Ana Sánchez",
    parentPhone: "+593992345678",
    parentEmail: "asanchez@email.com",
    emergencyContact: "+593992345679",
  },
  {
    firstName: "Valentina",
    lastName: "López Herrera",
    grade: "4to Básica",
    dateOfBirth: Date.now() - 9 * 365 * 24 * 60 * 60 * 1000,
    address: "Calle Toledo N24-89, La Floresta",
    homeLatitude: -0.1945,
    homeLongitude: -78.4892,
    parentName: "Roberto López",
    parentPhone: "+593993456789",
    parentEmail: "rlopez@email.com",
    emergencyContact: "+593993456790",
  },
  // 12 de Octubre / Orellana sector
  {
    firstName: "Mateo",
    lastName: "Herrera Cordero",
    grade: "5to Básica",
    dateOfBirth: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. 12 de Octubre N25-45 y Orellana",
    homeLatitude: -0.1932,
    homeLongitude: -78.4875,
    parentName: "Patricia Herrera",
    parentPhone: "+593994567890",
    parentEmail: "pherrera@email.com",
    emergencyContact: "+593994567891",
  },
  {
    firstName: "Emilio",
    lastName: "Castro Ruiz",
    grade: "6to Básica",
    dateOfBirth: Date.now() - 11 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. Orellana E9-123 y 12 de Octubre",
    homeLatitude: -0.1889,
    homeLongitude: -78.4812,
    parentName: "Carmen Castro",
    parentPhone: "+593984567890",
    parentEmail: "ccastro@email.com",
    emergencyContact: "+593984567891",
  },
  // La Carolina sector (northern part)
  {
    firstName: "Isabella",
    lastName: "Cordero Paz",
    grade: "3ro Básica",
    dateOfBirth: Date.now() - 8 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. República E7-120, La Carolina",
    homeLatitude: -0.1856,
    homeLongitude: -78.4823,
    parentName: "Juan Cordero",
    parentPhone: "+593995678901",
    parentEmail: "jcordero@email.com",
    emergencyContact: "+593995678902",
  },
  {
    firstName: "Sebastián",
    lastName: "Villacís Luna",
    grade: "6to Básica",
    dateOfBirth: Date.now() - 11 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. Naciones Unidas E9-34 y Amazonas",
    homeLatitude: -0.1789,
    homeLongitude: -78.4812,
    parentName: "María Villacís",
    parentPhone: "+593996789012",
    parentEmail: "mvillacis@email.com",
    emergencyContact: "+593996789013",
  },
  {
    firstName: "Camila",
    lastName: "Estrella Andrade",
    grade: "4to Básica",
    dateOfBirth: Date.now() - 9 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. Amazonas N36-45 y Naciones Unidas",
    homeLatitude: -0.1823,
    homeLongitude: -78.4867,
    parentName: "Pedro Estrella",
    parentPhone: "+593997890123",
    parentEmail: "pestrella@email.com",
    emergencyContact: "+593997890124",
  },
  // Shyris / Gaspar de Villarroel sector
  {
    firstName: "Lucas",
    lastName: "Andrade Morales",
    grade: "5to Básica",
    dateOfBirth: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. de los Shyris N32-123 y Gaspar de Villarroel",
    homeLatitude: -0.1778,
    homeLongitude: -78.4834,
    parentName: "Lucía Andrade",
    parentPhone: "+593998901234",
    parentEmail: "landrade@email.com",
    emergencyContact: "+593998901235",
  },
  {
    firstName: "Emma",
    lastName: "Paredes Vaca",
    grade: "3ro Básica",
    dateOfBirth: Date.now() - 8 * 365 * 24 * 60 * 60 * 1000,
    address: "Calle Rumipamba E3-56 y Shyris",
    homeLatitude: -0.1845,
    homeLongitude: -78.4756,
    parentName: "Fernando Paredes",
    parentPhone: "+593999012345",
    parentEmail: "fparedes@email.com",
    emergencyContact: "+593999012346",
  },
  // Eloy Alfaro / Quicentro sector
  {
    firstName: "Nicolás",
    lastName: "Vaca Mendez",
    grade: "6to Básica",
    dateOfBirth: Date.now() - 11 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. Eloy Alfaro N34-78 y Portugal",
    homeLatitude: -0.1802,
    homeLongitude: -78.4789,
    parentName: "Gabriela Vaca",
    parentPhone: "+593990123456",
    parentEmail: "gvaca@email.com",
    emergencyContact: "+593990123457",
  },
  // González Suárez sector
  {
    firstName: "Martina",
    lastName: "Guerrero Torres",
    grade: "4to Básica",
    dateOfBirth: Date.now() - 9 * 365 * 24 * 60 * 60 * 1000,
    address: "Calle Bello Horizonte E8-12, González Suárez",
    homeLatitude: -0.1912,
    homeLongitude: -78.4901,
    parentName: "Ricardo Guerrero",
    parentPhone: "+593981234567",
    parentEmail: "rguerrero@email.com",
    emergencyContact: "+593981234568",
  },
  {
    firstName: "Tomás",
    lastName: "Ruiz Paz",
    grade: "5to Básica",
    dateOfBirth: Date.now() - 10 * 365 * 24 * 60 * 60 * 1000,
    address: "Av. González Suárez N27-34 y Coruña",
    homeLatitude: -0.1956,
    homeLongitude: -78.4823,
    parentName: "Silvia Ruiz",
    parentPhone: "+593982345678",
    parentEmail: "sruiz@email.com",
    emergencyContact: "+593982345679",
  },
  // Whymper / Orellana sector
  {
    firstName: "Lucía",
    lastName: "Morales Castro",
    grade: "3ro Básica",
    dateOfBirth: Date.now() - 8 * 365 * 24 * 60 * 60 * 1000,
    address: "Calle Whymper E7-89 y Orellana",
    homeLatitude: -0.1878,
    homeLongitude: -78.4867,
    parentName: "Eduardo Morales",
    parentPhone: "+593983456789",
    parentEmail: "emorales@email.com",
    emergencyContact: "+593983456790",
  },
  {
    firstName: "Paula",
    lastName: "Mendez Estrella",
    grade: "4to Básica",
    dateOfBirth: Date.now() - 9 * 365 * 24 * 60 * 60 * 1000,
    address: "Calle Leonidas Plaza N23-45 y Whymper",
    homeLatitude: -0.1934,
    homeLongitude: -78.4856,
    parentName: "Miguel Méndez",
    parentPhone: "+593985678901",
    parentEmail: "mmendez@email.com",
    emergencyContact: "+593985678902",
  },
];

// ============================================================================
// ROUTE STOPS (7 strategic pickup points)
// These are common gathering points where multiple students can be picked up
// ============================================================================
export const DEMO_ROUTE_STOPS = [
  {
    name: "Parque La Carolina - Entrada Norte",
    address: "Av. Amazonas y Naciones Unidas",
    latitude: -0.1789,
    longitude: -78.4812,
    scheduledTime: "06:45",
    geofenceRadius: 100,
  },
  {
    name: "CC Quicentro Shopping",
    address: "Av. Naciones Unidas E9-10 y 6 de Diciembre",
    latitude: -0.1756,
    longitude: -78.4789,
    scheduledTime: "06:55",
    geofenceRadius: 100,
  },
  {
    name: "Av. Shyris y Gaspar de Villarroel",
    address: "Av. de los Shyris N32-45 y Gaspar de Villarroel",
    latitude: -0.1823,
    longitude: -78.4834,
    scheduledTime: "07:05",
    geofenceRadius: 100,
  },
  {
    name: "Parque El Ejido - Entrada 6 de Diciembre",
    address: "Av. 6 de Diciembre y Patria",
    latitude: -0.1945,
    longitude: -78.4867,
    scheduledTime: "07:15",
    geofenceRadius: 100,
  },
  {
    name: "La Floresta - Plaza Isabel La Católica",
    address: "Isabel La Católica y Toledo",
    latitude: -0.1967,
    longitude: -78.4892,
    scheduledTime: "07:25",
    geofenceRadius: 100,
  },
  {
    name: "González Suárez - Mirador",
    address: "Av. González Suárez N27-10 y Coruña",
    latitude: -0.1978,
    longitude: -78.4856,
    scheduledTime: "07:35",
    geofenceRadius: 100,
  },
  {
    name: "12 de Octubre y Orellana",
    address: "Av. 12 de Octubre N25-67 y Orellana",
    latitude: -0.1912,
    longitude: -78.4878,
    scheduledTime: "07:45",
    geofenceRadius: 100,
  },
];

// ============================================================================
// HELPER: Generate QR Code JSON
// ============================================================================
export function generateQRCode(studentId: string, institutionId: string): string {
  return JSON.stringify({
    studentId,
    institutionId,
    timestamp: Date.now(),
    version: 1,
  });
}
