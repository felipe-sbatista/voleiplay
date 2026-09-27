export interface Sport {
  id: string;
  name: string;
  icon: string; // Icon identifier (e.g., 'volleyball', 'dribble', 'trophy', 'activity', 'award', 'shield')
  positions: string[];
  defaultTeamSize: number;
  isPreset?: boolean;
  description?: string;
}

export const PRESET_SPORTS: Sport[] = [
  {
    id: 'volei_praia',
    name: 'Vôlei de Praia',
    icon: 'volleyball',
    positions: ['Bloqueador', 'Defensor', 'Levantador', 'Ponteiro', 'Completo'],
    defaultTeamSize: 2,
    isPreset: true,
    description: 'Vôlei em dupla ou quarteto na areia'
  },
  {
    id: 'volei_quadra',
    name: 'Vôlei de Quadra',
    icon: 'volleyball',
    positions: ['Levantador', 'Ponteiro', 'Oposto', 'Central', 'Líbero', 'Completo'],
    defaultTeamSize: 6,
    isPreset: true,
    description: 'Vôlei tradicional 6x6 indoor'
  },
  {
    id: 'futevolei',
    name: 'Futevôlei',
    icon: 'activity',
    positions: ['Atacante', 'Defensor', 'Passador', 'Completo'],
    defaultTeamSize: 2,
    isPreset: true,
    description: 'Futevôlei de praia 2x2 ou 3x3'
  },
  {
    id: 'futebol',
    name: 'Futebol / Society',
    icon: 'dribble',
    positions: ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-Campo', 'Atacante', 'Completo'],
    defaultTeamSize: 7,
    isPreset: true,
    description: 'Futebol Society, Futsal ou Campo'
  },
  {
    id: 'basquete',
    name: 'Basquete 3x3',
    icon: 'award',
    positions: ['Armador', 'Ala', 'Ala-Pivô', 'Pivô', 'Completo'],
    defaultTeamSize: 3,
    isPreset: true,
    description: 'Basquetebol de rua ou quadra'
  },
  {
    id: 'beach_tennis',
    name: 'Beach Tennis',
    icon: 'trophy',
    positions: ['Saque/Rede', 'Fundo de Quadra', 'Completo'],
    defaultTeamSize: 2,
    isPreset: true,
    description: 'Tênis de praia em duplas'
  }
];
