import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { Tournament } from '../models/tournament.model';
import { Match } from '../models/match.model';

export const INITIAL_PLAYERS: Player[] = [
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
    stats: { matches: 32, wins: 29, pointsScored: 395, mvps: 7 }
  },
  {
    id: 'p-5',
    name: 'Ondrej Perusic',
    nickname: 'Perusic',
    gender: 'M',
    position: 'Defensor',
    skillLevel: 5,
    height: 190,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    teamId: 't-3',
    bio: 'Campeão Mundial 2023, tática cirúrgica e leitura de jogo exemplar.',
    stats: { matches: 24, wins: 20, pointsScored: 290, mvps: 5 }
  },
  {
    id: 'p-6',
    name: 'David Schweiner',
    nickname: 'Schweiner',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 196,
    dominantHand: 'Canhoto',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    teamId: 't-3',
    bio: 'Canhoto potente no ataque de rede e bloqueio agressivo.',
    stats: { matches: 24, wins: 20, pointsScored: 350, mvps: 6 }
  },
  {
    id: 'p-7',
    name: 'Cherif Younousse',
    nickname: 'Cherif',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 198,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    teamId: 't-4',
    bio: 'Salto explosivo e alcance aéreo formidável na areia.',
    stats: { matches: 22, wins: 17, pointsScored: 310, mvps: 4 }
  },
  {
    id: 'p-8',
    name: 'Ahmed Tijan',
    nickname: 'Ahmed',
    gender: 'M',
    position: 'Defensor',
    skillLevel: 5,
    height: 191,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: 't-4',
    bio: 'Velocidade e reflexos impressionantes para recuperar bolas quase impossíveis.',
    stats: { matches: 22, wins: 17, pointsScored: 280, mvps: 3 }
  },
  {
    id: 'p-9',
    name: 'Evandro Gonçalves',
    nickname: 'Evandro',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 210,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    teamId: 't-5',
    bio: 'O saque mais potente do circuito mundial (>105 km/h) e bloqueio gigante.',
    stats: { matches: 20, wins: 15, pointsScored: 275, mvps: 4 }
  },
  {
    id: 'p-10',
    name: 'Arthur Lanci',
    nickname: 'Arthur',
    gender: 'M',
    position: 'Defensor',
    skillLevel: 4,
    height: 186,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    teamId: 't-5',
    bio: 'Volume de jogo alto e transição de contra-ataque letal.',
    stats: { matches: 20, wins: 15, pointsScored: 230, mvps: 2 }
  },
  {
    id: 'p-11',
    name: 'Kelly Cheng',
    nickname: 'Kelly',
    gender: 'F',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 188,
    dominantHand: 'Canhoto',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    teamId: 't-6',
    bio: 'Campeã Mundial com controle impecável nos toques e bloqueio técnico.',
    stats: { matches: 25, wins: 21, pointsScored: 330, mvps: 6 }
  },
  {
    id: 'p-12',
    name: 'Sara Hughes',
    nickname: 'Sara',
    gender: 'F',
    position: 'Defensor',
    skillLevel: 5,
    height: 178,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    teamId: 't-6',
    bio: 'Visão de quadra privilegiada e precisão cirúrgica no ataque colocado.',
    stats: { matches: 25, wins: 21, pointsScored: 310, mvps: 5 }
  },
  {
    id: 'p-13',
    name: 'Katja Stam',
    nickname: 'Stam',
    gender: 'F',
    position: 'Bloqueador',
    skillLevel: 5,
    height: 192,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    teamId: 't-7',
    bio: 'Força física dominante no ataque e bloqueio de elite europeu.',
    stats: { matches: 19, wins: 14, pointsScored: 260, mvps: 3 }
  },
  {
    id: 'p-14',
    name: 'Raisa Schoon',
    nickname: 'Schoon',
    gender: 'F',
    position: 'Defensor',
    skillLevel: 4,
    height: 176,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: 't-7',
    bio: 'Agilidade extraordinária e grande leitura das jogadas adversárias.',
    stats: { matches: 19, wins: 14, pointsScored: 210, mvps: 2 }
  },
  {
    id: 'p-15',
    name: 'Miles Partain',
    nickname: 'Partain',
    gender: 'M',
    position: 'Defensor',
    skillLevel: 5,
    height: 188,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    teamId: 't-8',
    bio: 'Revolucionou a dinâmica de ataque no segundo toque (jump set on 2).',
    stats: { matches: 18, wins: 13, pointsScored: 240, mvps: 4 }
  },
  {
    id: 'p-16',
    name: 'Andy Benesh',
    nickname: 'Benesh',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 4,
    height: 206,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teamId: 't-8',
    bio: 'Envergadura imponente e alta eficiência de virada de bola.',
    stats: { matches: 18, wins: 13, pointsScored: 255, mvps: 3 }
  },
  // Free agents pool for random draw
  {
    id: 'p-17',
    name: 'Felipe Alcantara',
    nickname: 'Lipe',
    gender: 'M',
    position: 'Levantador',
    skillLevel: 4,
    height: 184,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Levantamento rápido e distribuição equilibrada.',
    stats: { matches: 12, wins: 8, pointsScored: 90, mvps: 2 }
  },
  {
    id: 'p-18',
    name: 'Camila Brait',
    nickname: 'Mila',
    gender: 'F',
    position: 'Líbero',
    skillLevel: 5,
    height: 170,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Defesa e passe impecáveis com cobertura total de quadra.',
    stats: { matches: 15, wins: 11, pointsScored: 45, mvps: 3 }
  },
  {
    id: 'p-19',
    name: 'Rodrigo Santana',
    nickname: 'Rodrigão',
    gender: 'M',
    position: 'Bloqueador',
    skillLevel: 4,
    height: 202,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Experiência em decisões e bloqueio agressivo no centro de rede.',
    stats: { matches: 10, wins: 7, pointsScored: 110, mvps: 1 }
  },
  {
    id: 'p-20',
    name: 'Isabela Medeiros',
    nickname: 'Isa',
    gender: 'F',
    position: 'Ponteiro',
    skillLevel: 4,
    height: 183,
    dominantHand: 'Canhoto',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Ataque diagonal potente e ótimo aproveitamento no contra-ataque.',
    stats: { matches: 14, wins: 9, pointsScored: 140, mvps: 2 }
  },
  {
    id: 'p-21',
    name: 'Lucas Sauer',
    nickname: 'Sauer',
    gender: 'M',
    position: 'Oposto',
    skillLevel: 4,
    height: 195,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Definição pesada na saída de rede e saque viagem consistente.',
    stats: { matches: 11, wins: 7, pointsScored: 135, mvps: 2 }
  },
  {
    id: 'p-22',
    name: 'Beatriz Fontes',
    nickname: 'Bia',
    gender: 'F',
    position: 'Defensor',
    skillLevel: 4,
    height: 177,
    dominantHand: 'Destro',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    teamId: null,
    bio: 'Especialista em areia pesada e toques precisos nas pontas.',
    stats: { matches: 9, wins: 6, pointsScored: 80, mvps: 1 }
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't-1',
    name: 'Duda / Ana Patrícia',
    category: 'Dupla (2x2)',
    city: 'Rio de Janeiro',
    country: 'Brasil',
    flag: '🇧🇷',
    color: '#D4F63D',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/BRA.png',
    seed: 1,
    playerIds: ['p-1', 'p-2'],
    stats: {
      matches: 4,
      wins: 4,
      losses: 0,
      setsWon: 8,
      setsLost: 1,
      pointsFor: 185,
      pointsAgainst: 142,
      pointsRatio: 1.30,
      tournamentPoints: 12
    },
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 't-2',
    name: 'Mol / Sørum',
    category: 'Dupla (2x2)',
    city: 'Oslo',
    country: 'Noruega',
    flag: '🇳🇴',
    color: '#3B82F6',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/NOR.png',
    seed: 2,
    playerIds: ['p-3', 'p-4'],
    stats: {
      matches: 4,
      wins: 3,
      losses: 1,
      setsWon: 7,
      setsLost: 3,
      pointsFor: 198,
      pointsAgainst: 165,
      pointsRatio: 1.20,
      tournamentPoints: 10
    },
    createdAt: '2026-08-15T10:05:00Z'
  },
  {
    id: 't-3',
    name: 'Perusic / Schweiner',
    category: 'Dupla (2x2)',
    city: 'Praga',
    country: 'República Tcheca',
    flag: '🇨🇿',
    color: '#EF4444',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/CZE.png',
    seed: 3,
    playerIds: ['p-5', 'p-6'],
    stats: {
      matches: 3,
      wins: 2,
      losses: 1,
      setsWon: 5,
      setsLost: 3,
      pointsFor: 154,
      pointsAgainst: 145,
      pointsRatio: 1.06,
      tournamentPoints: 7
    },
    createdAt: '2026-08-15T10:10:00Z'
  },
  {
    id: 't-4',
    name: 'Cherif / Ahmed',
    category: 'Dupla (2x2)',
    city: 'Doha',
    country: 'Catar',
    flag: '🇶🇦',
    color: '#8B5CF6',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/QAT.png',
    seed: 4,
    playerIds: ['p-7', 'p-8'],
    stats: {
      matches: 3,
      wins: 2,
      losses: 1,
      setsWon: 4,
      setsLost: 3,
      pointsFor: 140,
      pointsAgainst: 135,
      pointsRatio: 1.04,
      tournamentPoints: 6
    },
    createdAt: '2026-08-15T10:15:00Z'
  },
  {
    id: 't-5',
    name: 'Evandro / Arthur',
    category: 'Dupla (2x2)',
    city: 'Niterói',
    country: 'Brasil',
    flag: '🇧🇷',
    color: '#10B981',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/BRA.png',
    seed: 5,
    playerIds: ['p-9', 'p-10'],
    stats: {
      matches: 3,
      wins: 2,
      losses: 1,
      setsWon: 4,
      setsLost: 2,
      pointsFor: 132,
      pointsAgainst: 120,
      pointsRatio: 1.10,
      tournamentPoints: 6
    },
    createdAt: '2026-08-15T10:20:00Z'
  },
  {
    id: 't-6',
    name: 'Cheng / Hughes',
    category: 'Dupla (2x2)',
    city: 'Los Angeles',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    color: '#F59E0B',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/USA.png',
    seed: 6,
    playerIds: ['p-11', 'p-12'],
    stats: {
      matches: 3,
      wins: 1,
      losses: 2,
      setsWon: 3,
      setsLost: 4,
      pointsFor: 128,
      pointsAgainst: 138,
      pointsRatio: 0.93,
      tournamentPoints: 4
    },
    createdAt: '2026-08-15T10:25:00Z'
  },
  {
    id: 't-7',
    name: 'Stam / Schoon',
    category: 'Dupla (2x2)',
    city: 'Haia',
    country: 'Holanda',
    flag: '🇳🇱',
    color: '#EC4899',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/NED.png',
    seed: 7,
    playerIds: ['p-13', 'p-14'],
    stats: {
      matches: 2,
      wins: 0,
      losses: 2,
      setsWon: 1,
      setsLost: 4,
      pointsFor: 85,
      pointsAgainst: 102,
      pointsRatio: 0.83,
      tournamentPoints: 2
    },
    createdAt: '2026-08-15T10:30:00Z'
  },
  {
    id: 't-8',
    name: 'Partain / Benesh',
    category: 'Dupla (2x2)',
    city: 'San Diego',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    color: '#06B6D4',
    avatarUrl: 'https://images.volleyballworld.com/image/upload/f_auto/assets/flags/USA.png',
    seed: 8,
    playerIds: ['p-15', 'p-16'],
    stats: {
      matches: 2,
      wins: 0,
      losses: 2,
      setsWon: 0,
      setsLost: 4,
      pointsFor: 68,
      pointsAgainst: 88,
      pointsRatio: 0.77,
      tournamentPoints: 1
    },
    createdAt: '2026-08-15T10:35:00Z'
  }
];

import { Sport, PRESET_SPORTS } from '../models/sport.model';

export const INITIAL_SPORTS: Sport[] = PRESET_SPORTS;

export const INITIAL_TOURNAMENT: Tournament = {
  id: 'tour-1',
  name: 'BEACH PRO TOUR ELITE 16',
  subtitle: 'RIO DE JANEIRO 2026',
  edition: '2026 World Tour Grand Slam',
  location: 'Arena Copacabana, Rio de Janeiro',
  season: '2026',
  format: 'single_elimination',
  category: 'Dupla (2x2)',
  sportId: 'volei_praia',
  status: 'in_progress',
  currentStage: 'Semifinais',
  championTeamId: null,
  runnerUpTeamId: null,
  thirdPlaceTeamId: null,
  bannerImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1600&auto=format&fit=crop&q=80',
  createdAt: '2026-08-20T08:00:00Z'
};

export const INITIAL_MATCHES: Match[] = [
  // Quartas de Final (Round 1 of 8-team bracket)
  {
    id: 'm-q1',
    tournamentId: 'tour-1',
    stage: 'quarterfinals',
    stageName: 'Quartas de Final',
    roundIndex: 0,
    matchIndex: 0,
    team1Id: 't-1', // Duda / Ana Patrícia
    team2Id: 't-8', // Partain / Benesh
    team1Sets: 2,
    team2Sets: 0,
    sets: [
      { setNumber: 1, team1Score: 21, team2Score: 16 },
      { setNumber: 2, team1Score: 21, team2Score: 14 }
    ],
    status: 'finished',
    winnerId: 't-1',
    court: 'Quadra Central (Rede 1)',
    scheduledTime: '10:00',
    mvpPlayerName: 'Ana Patrícia Ramos',
    nextMatchId: 'm-s1',
    nextMatchSlot: 1
  },
  {
    id: 'm-q2',
    tournamentId: 'tour-1',
    stage: 'quarterfinals',
    stageName: 'Quartas de Final',
    roundIndex: 0,
    matchIndex: 1,
    team1Id: 't-4', // Cherif / Ahmed
    team2Id: 't-5', // Evandro / Arthur
    team1Sets: 1,
    team2Sets: 2,
    sets: [
      { setNumber: 1, team1Score: 21, team2Score: 19 },
      { setNumber: 2, team1Score: 18, team2Score: 21 },
      { setNumber: 3, team1Score: 13, team2Score: 15 }
    ],
    status: 'finished',
    winnerId: 't-5',
    court: 'Quadra Central (Rede 1)',
    scheduledTime: '11:15',
    mvpPlayerName: 'Evandro Gonçalves',
    nextMatchId: 'm-s1',
    nextMatchSlot: 2
  },
  {
    id: 'm-q3',
    tournamentId: 'tour-1',
    stage: 'quarterfinals',
    stageName: 'Quartas de Final',
    roundIndex: 0,
    matchIndex: 2,
    team1Id: 't-2', // Mol / Sørum
    team2Id: 't-7', // Stam / Schoon
    team1Sets: 2,
    team2Sets: 0,
    sets: [
      { setNumber: 1, team1Score: 21, team2Score: 17 },
      { setNumber: 2, team1Score: 21, team2Score: 18 }
    ],
    status: 'finished',
    winnerId: 't-2',
    court: 'Quadra 2',
    scheduledTime: '10:00',
    mvpPlayerName: 'Anders Mol',
    nextMatchId: 'm-s2',
    nextMatchSlot: 1
  },
  {
    id: 'm-q4',
    tournamentId: 'tour-1',
    stage: 'quarterfinals',
    stageName: 'Quartas de Final',
    roundIndex: 0,
    matchIndex: 3,
    team1Id: 't-3', // Perusic / Schweiner
    team2Id: 't-6', // Cheng / Hughes
    team1Sets: 2,
    team2Sets: 1,
    sets: [
      { setNumber: 1, team1Score: 21, team2Score: 19 },
      { setNumber: 2, team1Score: 19, team2Score: 21 },
      { setNumber: 3, team1Score: 15, team2Score: 12 }
    ],
    status: 'finished',
    winnerId: 't-3',
    court: 'Quadra 2',
    scheduledTime: '11:15',
    mvpPlayerName: 'David Schweiner',
    nextMatchId: 'm-s2',
    nextMatchSlot: 2
  },
  // Semifinais
  {
    id: 'm-s1',
    tournamentId: 'tour-1',
    stage: 'semifinals',
    stageName: 'Semifinal 1',
    roundIndex: 1,
    matchIndex: 0,
    team1Id: 't-1', // Duda / Ana Patrícia
    team2Id: 't-5', // Evandro / Arthur
    team1Sets: 1,
    team2Sets: 0,
    sets: [
      { setNumber: 1, team1Score: 21, team2Score: 18 },
      { setNumber: 2, team1Score: 14, team2Score: 12 }
    ],
    status: 'live',
    winnerId: null,
    court: 'Quadra Central (Rede 1)',
    scheduledTime: '14:30',
    nextMatchId: 'm-final',
    nextMatchSlot: 1
  },
  {
    id: 'm-s2',
    tournamentId: 'tour-1',
    stage: 'semifinals',
    stageName: 'Semifinal 2',
    roundIndex: 1,
    matchIndex: 1,
    team1Id: 't-2', // Mol / Sørum
    team2Id: 't-3', // Perusic / Schweiner
    team1Sets: 0,
    team2Sets: 0,
    sets: [],
    status: 'scheduled',
    winnerId: null,
    court: 'Quadra Central (Rede 1)',
    scheduledTime: '16:00',
    nextMatchId: 'm-final',
    nextMatchSlot: 2
  },
  // Grande Final
  {
    id: 'm-final',
    tournamentId: 'tour-1',
    stage: 'finals',
    stageName: 'Grande Final Ouro',
    roundIndex: 2,
    matchIndex: 0,
    team1Id: null,
    team2Id: null,
    team1Sets: 0,
    team2Sets: 0,
    sets: [],
    status: 'scheduled',
    winnerId: null,
    court: 'Quadra Central (Rede 1)',
    scheduledTime: '18:30'
  },
  // Disputa de 3º Lugar Bronze
  {
    id: 'm-third',
    tournamentId: 'tour-1',
    stage: 'third_place',
    stageName: 'Disputa de Bronze (3º Lugar)',
    roundIndex: 2,
    matchIndex: 1,
    team1Id: null,
    team2Id: null,
    team1Sets: 0,
    team2Sets: 0,
    sets: [],
    status: 'scheduled',
    winnerId: null,
    court: 'Quadra 2',
    scheduledTime: '17:15'
  }
];
