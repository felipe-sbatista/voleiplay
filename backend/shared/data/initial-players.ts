import { PlayerData } from '../types/player.types.js';

export const INITIAL_PLAYERS: PlayerData[] = [
  {
    id: 'p-1',
    name: 'Eduarda Santos Lisboa',
    nickname: 'Duda',
    gender: 'F',
    position: 'Defensor',
    skillLevel: 5,
    height: 180,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80',
    teamId: 't-1',
    bio: 'Campeã Olímpica e Mundial, especialista em defesas espetaculares na areia.',
    stats: { matches: 28, wins: 26, pointsScored: 340, mvps: 8 }
  },
  {
    id: 'p-2',
    name: 'Ana Patrícia Ramos',
    nickname: 'Ana Patrícia',
    gender: 'F',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 194,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teamId: 't-1',
    bio: 'Paredão incontestável na rede e Campeã Olímpica de Vôlei de Praia.',
    stats: { matches: 28, wins: 26, pointsScored: 410, mvps: 9 }
  },
  {
    id: 'p-3',
    name: 'Anders Mol',
    nickname: 'Mol',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 200,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teamId: 't-2',
    bio: 'A lenda dos Beachvolley Vikings, eleito melhor bloqueador do mundo por múltiplos anos.',
    stats: { matches: 32, wins: 29, pointsScored: 480, mvps: 11 }
  },
  {
    id: 'p-4',
    name: 'Christian Sørum',
    nickname: 'Sørum',
    gender: 'M',
    position: 'Defensor',
    skillLevel: 5,
    height: 192,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    teamId: 't-2',
    bio: 'Mestre da precisão no passe e ataques rápidos pelas extremidades.',
    stats: { matches: 32, wins: 29, pointsScored: 390, mvps: 7 }
  },
  {
    id: 'p-5',
    name: 'Ágatha Bednarczuk',
    nickname: 'Ágatha',
    gender: 'F',
    position: 'Defensor',
    skillLevel: 4,
    height: 182,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    teamId: 't-3',
    bio: 'Medalhista Olímpica do Rio 2016 e referência de liderança nas quadras de areia.',
    stats: { matches: 24, wins: 18, pointsScored: 280, mvps: 4 }
  },
  {
    id: 'p-6',
    name: 'Rebecca Cavalcante',
    nickname: 'Rebecca',
    gender: 'F',
    position: 'Bloqueador',
    skillLevel: 4,
    height: 184,
    dominantHand: 'Canhoto',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    teamId: 't-3',
    bio: 'Canhota veloz com ataques imprevisíveis na diagonal curta.',
    stats: { matches: 24, wins: 18, pointsScored: 310, mvps: 5 }
  }
];

export function getInitialPlayersClone(): PlayerData[] {
  return JSON.parse(JSON.stringify(INITIAL_PLAYERS));
}
