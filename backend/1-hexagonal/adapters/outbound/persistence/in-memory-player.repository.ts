import { PlayerRepositoryPort } from '../../../domain/ports/outbound/player-repository.port.js';
import { Player } from '../../../domain/player.entity.js';
import { PlayerData } from '../../../../shared/types/player.types.js';
import { getInitialPlayersClone } from '../../../../shared/data/initial-players.js';

export class InMemoryPlayerRepository implements PlayerRepositoryPort {
  private playersMap: Map<string, PlayerData> = new Map();

  constructor() {
    // Carrega dados iniciais didáticos
    const initial = getInitialPlayersClone();
    for (const p of initial) {
      this.playersMap.set(p.id, p);
    }
  }

  async save(player: Player): Promise<void> {
    this.playersMap.set(player.id, player.toDTO());
  }

  async findById(id: string): Promise<Player | null> {
    const data = this.playersMap.get(id);
    if (!data) return null;
    return Player.create(data);
  }

  async findAll(filter?: { position?: string; gender?: string; search?: string }): Promise<Player[]> {
    let list = Array.from(this.playersMap.values());

    if (filter?.position) {
      list = list.filter(p => p.position.toLowerCase() === filter.position?.toLowerCase());
    }
    if (filter?.gender) {
      list = list.filter(p => p.gender.toUpperCase() === filter.gender?.toUpperCase());
    }
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.nickname?.toLowerCase().includes(term)
      );
    }

    return list.map(data => Player.create(data));
  }

  async update(player: Player): Promise<void> {
    this.playersMap.set(player.id, player.toDTO());
  }

  async delete(id: string): Promise<boolean> {
    return this.playersMap.delete(id);
  }
}
