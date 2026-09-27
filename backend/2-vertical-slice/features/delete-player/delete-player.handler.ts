import { IDeletePlayerRepository, DeletePlayerRepository } from './delete-player.repository.js';

export class DeletePlayerHandler {
  constructor(private readonly repository: IDeletePlayerRepository = new DeletePlayerRepository()) {}

  async handle(id: string): Promise<boolean> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new Error(`Jogador com id '${id}' não encontrado.`);
    }
    return this.repository.delete(id);
  }
}
