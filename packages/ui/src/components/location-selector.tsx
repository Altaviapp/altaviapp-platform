'use client';

import * as React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { CountryCode } from './phone-input';

// ============================================================================
// TYPES
// ============================================================================

export interface LocationValue {
  country: CountryCode;
  department: string;
  city: string;
}

export interface LocationSelectorProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  defaultCountry?: CountryCode;
  showCountry?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  autoDetectCountry?: boolean;
  labels?: {
    country?: string;
    department?: string;
    city?: string;
  };
}

interface Department {
  code: string;
  name: string;
}

// ============================================================================
// DATA - Ecuador (24 provinces) and Colombia (33 departments)
// ============================================================================

const COUNTRIES = [
  { code: 'EC' as CountryCode, name: 'Ecuador', flag: '🇪🇨' },
  { code: 'CO' as CountryCode, name: 'Colombia', flag: '🇨🇴' },
];

const DEPARTMENTS: Record<CountryCode, Department[]> = {
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

const CITIES: Record<CountryCode, Record<string, string[]>> = {
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

// ============================================================================
// UTILITIES
// ============================================================================

const detectCountryFromIP = async (): Promise<CountryCode> => {
  try {
    const response = await fetch('https://ipapi.co/country/', {
      signal: AbortSignal.timeout(3000),
    });
    const countryCode = await response.text();
    return countryCode === 'CO' ? 'CO' : 'EC';
  } catch {
    return 'EC';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const LocationSelector = React.forwardRef<HTMLDivElement, LocationSelectorProps>(
  (
    {
      value,
      onChange,
      defaultCountry = 'EC',
      showCountry = true,
      error,
      disabled = false,
      className,
      autoDetectCountry = true,
      labels = {},
    },
    ref
  ) => {
    const { country: countryLabel = 'País', department: deptLabel = 'Provincia/Departamento', city: cityLabel = 'Ciudad' } = labels;

    // Initialize with default or detected country
    React.useEffect(() => {
      if (autoDetectCountry && !value.country) {
        detectCountryFromIP().then((code) => {
          onChange({ ...value, country: code, department: '', city: '' });
        });
      }
    }, [autoDetectCountry, value, onChange]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCountry = e.target.value as CountryCode;
      onChange({
        country: newCountry,
        department: '',
        city: '',
      });
    };

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newDepartment = e.target.value;
      onChange({
        ...value,
        department: newDepartment,
        city: '',
      });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({
        ...value,
        city: e.target.value,
      });
    };

    const departments = value.country ? DEPARTMENTS[value.country] || [] : [];
    const cities = value.country && value.department ? CITIES[value.country]?.[value.department] || [] : [];

    const selectBaseClasses = cn(
      'w-full px-3 py-2.5 text-sm text-gray-900 border rounded-lg appearance-none bg-white cursor-pointer transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:border-gray-400',
      error ? 'border-red-500' : 'border-gray-300'
    );

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Header */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>Ubicación</span>
        </div>

        {/* Country - Full width */}
        {showCountry && (
          <div className="space-y-1.5">
            <label className="block text-sm text-gray-600">
              {countryLabel}
            </label>
            <div className="relative">
              <select
                value={value.country || defaultCountry}
                onChange={handleCountryChange}
                disabled={disabled}
                className={selectBaseClasses}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Department and City - Side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Department Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm text-gray-600">
              {value.country === 'EC' ? 'Provincia' : value.country === 'CO' ? 'Departamento' : deptLabel}
            </label>
            <div className="relative">
              <select
                value={value.department || ''}
                onChange={handleDepartmentChange}
                disabled={disabled || !value.country}
                className={selectBaseClasses}
              >
                <option value="">Seleccionar...</option>
                {departments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* City Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm text-gray-600">
              {cityLabel}
            </label>
            <div className="relative">
              <select
                value={value.city || ''}
                onChange={handleCityChange}
                disabled={disabled || !value.department}
                className={selectBaseClasses}
              >
                <option value="">Seleccionar...</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

LocationSelector.displayName = 'LocationSelector';

export { LocationSelector, DEPARTMENTS, CITIES };
