export interface DeletePlayerPort {
  execute(id: string): Promise<void>;
}
