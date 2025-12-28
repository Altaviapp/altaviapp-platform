/**
 * Location Data for Ecuador and Colombia
 *
 * Contains countries, departments/provinces, and cities
 * for use in location selectors throughout the app.
 */

export type CountryCode = 'EC' | 'CO';

export interface Country {
  code: CountryCode;
  name: string;
  phoneCode: string;
  phoneDigits: number;
  timezone: string;
  flag: string;
}

export interface Department {
  code: string;
  name: string;
}

// ============================================================================
// COUNTRIES
// ============================================================================

export const COUNTRIES: Country[] = [
  {
    code: 'EC',
    name: 'Ecuador',
    phoneCode: '+593',
    phoneDigits: 9,
    timezone: 'America/Guayaquil',
    flag: '🇪🇨'
  },
  {
    code: 'CO',
    name: 'Colombia',
    phoneCode: '+57',
    phoneDigits: 10,
    timezone: 'America/Bogota',
    flag: '🇨🇴'
  },
];

export const getCountryByCode = (code: CountryCode): Country | undefined => {
  return COUNTRIES.find(c => c.code === code);
};

// ============================================================================
// DEPARTMENTS / PROVINCES
// ============================================================================

export const DEPARTMENTS: Record<CountryCode, Department[]> = {
  // Ecuador - 24 Provincias
  EC: [
    { code: 'A', name: 'Azuay' },
    { code: 'B', name: 'Bolívar' },
    { code: 'F', name: 'Cañar' },
    { code: 'C', name: 'Carchi' },
    { code: 'H', name: 'Chimborazo' },
    { code: 'X', name: 'Cotopaxi' },
    { code: 'O', name: 'El Oro' },
    { code: 'E', name: 'Esmeraldas' },
    { code: 'W', name: 'Galápagos' },
    { code: 'G', name: 'Guayas' },
    { code: 'I', name: 'Imbabura' },
    { code: 'L', name: 'Loja' },
    { code: 'R', name: 'Los Ríos' },
    { code: 'M', name: 'Manabí' },
    { code: 'S', name: 'Morona Santiago' },
    { code: 'N', name: 'Napo' },
    { code: 'D', name: 'Orellana' },
    { code: 'Y', name: 'Pastaza' },
    { code: 'P', name: 'Pichincha' },
    { code: 'SE', name: 'Santa Elena' },
    { code: 'SD', name: 'Santo Domingo de los Tsáchilas' },
    { code: 'U', name: 'Sucumbíos' },
    { code: 'T', name: 'Tungurahua' },
    { code: 'Z', name: 'Zamora Chinchipe' },
  ],
  // Colombia - 32 Departamentos + Bogotá D.C.
  CO: [
    { code: 'AMA', name: 'Amazonas' },
    { code: 'ANT', name: 'Antioquia' },
    { code: 'ARA', name: 'Arauca' },
    { code: 'ATL', name: 'Atlántico' },
    { code: 'DC', name: 'Bogotá D.C.' },
    { code: 'BOL', name: 'Bolívar' },
    { code: 'BOY', name: 'Boyacá' },
    { code: 'CAL', name: 'Caldas' },
    { code: 'CAQ', name: 'Caquetá' },
    { code: 'CAS', name: 'Casanare' },
    { code: 'CAU', name: 'Cauca' },
    { code: 'CES', name: 'Cesar' },
    { code: 'CHO', name: 'Chocó' },
    { code: 'COR', name: 'Córdoba' },
    { code: 'CUN', name: 'Cundinamarca' },
    { code: 'GUA', name: 'Guainía' },
    { code: 'GUV', name: 'Guaviare' },
    { code: 'HUI', name: 'Huila' },
    { code: 'LAG', name: 'La Guajira' },
    { code: 'MAG', name: 'Magdalena' },
    { code: 'MET', name: 'Meta' },
    { code: 'NAR', name: 'Nariño' },
    { code: 'NSA', name: 'Norte de Santander' },
    { code: 'PUT', name: 'Putumayo' },
    { code: 'QUI', name: 'Quindío' },
    { code: 'RIS', name: 'Risaralda' },
    { code: 'SAP', name: 'San Andrés y Providencia' },
    { code: 'SAN', name: 'Santander' },
    { code: 'SUC', name: 'Sucre' },
    { code: 'TOL', name: 'Tolima' },
    { code: 'VAC', name: 'Valle del Cauca' },
    { code: 'VAU', name: 'Vaupés' },
    { code: 'VID', name: 'Vichada' },
  ],
};

export const getDepartmentsByCountry = (countryCode: CountryCode): Department[] => {
  return DEPARTMENTS[countryCode] || [];
};

// ============================================================================
// CITIES (Main cities per department)
// ============================================================================

export const CITIES: Record<CountryCode, Record<string, string[]>> = {
  // Ecuador cities by province code
  EC: {
    A: ['Cuenca', 'Gualaceo', 'Paute', 'Sigsig', 'Santa Isabel', 'Girón', 'Chordeleg'],
    B: ['Guaranda', 'San Miguel', 'Chillanes', 'Chimbo', 'Echeandía', 'Caluma'],
    F: ['Azogues', 'Biblián', 'Cañar', 'La Troncal', 'El Tambo', 'Déleg'],
    C: ['Tulcán', 'San Gabriel', 'El Ángel', 'Mira', 'Bolívar', 'Huaca'],
    H: ['Riobamba', 'Guano', 'Alausí', 'Colta', 'Chambo', 'Chunchi', 'Pallatanga'],
    X: ['Latacunga', 'Salcedo', 'Pujilí', 'Saquisilí', 'La Maná', 'Pangua', 'Sigchos'],
    O: ['Machala', 'Pasaje', 'Santa Rosa', 'Huaquillas', 'El Guabo', 'Arenillas', 'Piñas'],
    E: ['Esmeraldas', 'Atacames', 'Quinindé', 'San Lorenzo', 'Muisne', 'Río Verde'],
    W: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
    G: ['Guayaquil', 'Durán', 'Samborondón', 'Daule', 'Milagro', 'Playas', 'Naranjal', 'El Triunfo', 'Naranjito', 'Yaguachi'],
    I: ['Ibarra', 'Otavalo', 'Cotacachi', 'Antonio Ante', 'Pimampiro', 'Urcuquí'],
    L: ['Loja', 'Catamayo', 'Macará', 'Cariamanga', 'Saraguro', 'Vilcabamba', 'Gonzanamá'],
    R: ['Babahoyo', 'Quevedo', 'Vinces', 'Ventanas', 'Buena Fe', 'Valencia', 'Montalvo'],
    M: ['Portoviejo', 'Manta', 'Jipijapa', 'Chone', 'El Carmen', 'Montecristi', 'Bahía de Caráquez', 'Pedernales', 'Sucre'],
    S: ['Macas', 'Gualaquiza', 'Sucúa', 'Limón Indanza', 'Morona', 'Santiago'],
    N: ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola'],
    D: ['Puerto Francisco de Orellana (Coca)', 'Loreto', 'Joya de los Sachas', 'Aguarico'],
    Y: ['Puyo', 'Mera', 'Santa Clara', 'Arajuno', 'Pastaza'],
    P: ['Quito', 'Sangolquí (Rumiñahui)', 'Cayambe', 'Machachi (Mejía)', 'Tabacundo', 'Pedro Vicente Maldonado', 'San Miguel de los Bancos', 'Puerto Quito'],
    SE: ['Santa Elena', 'La Libertad', 'Salinas'],
    SD: ['Santo Domingo'],
    U: ['Nueva Loja (Lago Agrio)', 'Shushufindi', 'Cuyabeno', 'Gonzalo Pizarro', 'Putumayo', 'Sucumbíos', 'Cascales'],
    T: ['Ambato', 'Baños', 'Pelileo', 'Píllaro', 'Cevallos', 'Mocha', 'Patate', 'Quero', 'Tisaleo'],
    Z: ['Zamora', 'Yantzaza', 'Zumbi', 'Centinela del Cóndor', 'Nangaritza', 'Palanda', 'Yacuambi', 'El Pangui', 'Chinchipe'],
  },
  // Colombia cities by department code
  CO: {
    AMA: ['Leticia', 'Puerto Nariño'],
    ANT: ['Medellín', 'Envigado', 'Bello', 'Itagüí', 'Rionegro', 'Sabaneta', 'La Estrella', 'Copacabana', 'Apartadó', 'Turbo', 'Caucasia', 'El Carmen de Viboral'],
    ARA: ['Arauca', 'Tame', 'Saravena', 'Arauquita', 'Fortul', 'Cravo Norte'],
    ATL: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Galapa', 'Sabanalarga', 'Baranoa', 'Santo Tomás'],
    DC: ['Bogotá'],
    BOL: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'San Juan Nepomuceno', 'Santa Rosa', 'Mompós'],
    BOY: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Puerto Boyacá', 'Villa de Leyva', 'Moniquirá'],
    CAL: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Supía', 'Anserma', 'Aguadas'],
    CAQ: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'Belén de los Andaquíes', 'Cartagena del Chairá'],
    CAS: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo', 'Monterrey', 'Maní', 'Orocué'],
    CAU: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Piendamó', 'El Tambo', 'Patía', 'Miranda', 'Corinto'],
    CES: ['Valledupar', 'Aguachica', 'Codazzi', 'La Jagua de Ibirico', 'Bosconia', 'Chimichagua', 'Curumaní', 'El Copey'],
    CHO: ['Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Bahía Solano', 'Nuquí', 'Alto Baudó', 'Medio Baudó'],
    COR: ['Montería', 'Lorica', 'Cereté', 'Sahagún', 'Tierralta', 'Montelíbano', 'Planeta Rica', 'San Andrés de Sotavento'],
    CUN: ['Soacha', 'Girardot', 'Facatativá', 'Zipaquirá', 'Chía', 'Fusagasugá', 'Mosquera', 'Madrid', 'Cajicá', 'La Calera', 'Cota', 'Sopó', 'Tocancipá', 'Tabio'],
    GUA: ['Inírida'],
    GUV: ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
    HUI: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Gigante', 'San Agustín', 'Palermo'],
    LAG: ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'Fonseca', 'San Juan del Cesar', 'Villanueva', 'Barrancas'],
    MAG: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato', 'Aracataca', 'Pivijay', 'Zona Bananera'],
    MET: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín', 'Restrepo', 'Cumaral', 'Puerto Gaitán'],
    NAR: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'La Unión', 'Samaniego', 'Sandoná', 'El Charco'],
    NSA: ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios', 'El Zulia', 'Tibú', 'Chinácota'],
    PUT: ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Villagarzón', 'Puerto Caicedo', 'San Miguel', 'Puerto Guzmán'],
    QUI: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya', 'Circasia', 'Filandia', 'Salento'],
    RIS: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belén de Umbría', 'Apía', 'Santuario'],
    SAP: ['San Andrés', 'Providencia'],
    SAN: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Barbosa', 'Vélez', 'Málaga'],
    SUC: ['Sincelejo', 'Corozal', 'San Marcos', 'Tolú', 'San Onofre', 'Sampués', 'Sincé', 'Coveñas'],
    TOL: ['Ibagué', 'Espinal', 'Melgar', 'Chaparral', 'Honda', 'Líbano', 'Mariquita', 'Flandes', 'Guamo', 'Purificación'],
    VAC: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí', 'Yumbo', 'Florida', 'Pradera', 'Candelaria', 'Zarzal'],
    VAU: ['Mitú', 'Caruru', 'Taraira'],
    VID: ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía'],
  },
};

export const getCitiesByDepartment = (countryCode: CountryCode, departmentCode: string): string[] => {
  return CITIES[countryCode]?.[departmentCode] || [];
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Detect user's country from IP address
 * Returns 'EC' as default if detection fails
 */
export const detectCountryFromIP = async (): Promise<CountryCode> => {
  try {
    const response = await fetch('https://ipapi.co/country/', {
      signal: AbortSignal.timeout(3000)
    });
    const countryCode = await response.text();
    return countryCode === 'CO' ? 'CO' : 'EC';
  } catch {
    return 'EC'; // Default to Ecuador
  }
};

/**
 * Format phone number for display
 */
export const formatPhoneDisplay = (phone: string, countryCode: CountryCode): string => {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;

  const digits = phone.replace(/\D/g, '').slice(country.phoneCode.length - 1);

  if (countryCode === 'EC' && digits.length === 9) {
    // Ecuador: +593 99 123 4567
    return `${country.phoneCode} ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  } else if (countryCode === 'CO' && digits.length === 10) {
    // Colombia: +57 310 123 4567
    return `${country.phoneCode} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return phone;
};

/**
 * Validate phone number format
 */
export const isValidPhoneFormat = (phone: string): boolean => {
  // Ecuador: +593 + 9 digits
  if (/^\+593\d{9}$/.test(phone)) return true;
  // Colombia: +57 + 10 digits
  if (/^\+57\d{10}$/.test(phone)) return true;
  return false;
};

/**
 * Get country code from phone number
 */
export const getCountryFromPhone = (phone: string): CountryCode | null => {
  if (phone.startsWith('+593')) return 'EC';
  if (phone.startsWith('+57')) return 'CO';
  return null;
};
