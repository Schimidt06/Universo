
export interface Mission {
  name: string;
  year: string;
  status: 'Ativa' | 'Encerrada' | 'Sucesso' | 'Falha';
  agency: string;
}

export interface ScienceData {
  atmosphere: string;
  structure: string;
  pressure: string;
  magneticField: string;
  curiosities: string[];
}

export interface PlanetData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  distance: number; // In astronomical units (relative)
  radius: number; // Scaled radius
  color: string;
  textureUrl?: string;
  stats: {
    diameter: string;
    mass: string;
    gravity: string;
    temp: string;
    day: string;
    year: string;
    moons: number;
  };
  science: ScienceData;
  missions: Mission[];
}

export type ViewMode = 'solar_system' | 'planet_focus';
