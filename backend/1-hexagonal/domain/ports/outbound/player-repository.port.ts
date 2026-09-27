import { Player } from '../../player.entity.js';

export interface PlayerRepositoryPort {
  save(player: Player): Promise<void>;
  findById(id: string): Promise<Player | null>;
  findAll(filter?: { position?: string; gender?: string; search?: string }): Promise<Player[]>;
  update(player: Player): Promise<void>;
  delete(id: string): Promise<boolean>;
}
