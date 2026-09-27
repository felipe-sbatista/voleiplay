export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class PlayerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Jogador com id '${id}' não foi encontrado.`);
    this.name = 'PlayerNotFoundError';
  }
}

export class InvalidPlayerSkillError extends DomainError {
  constructor(skill: number) {
    super(`Nível de habilidade deve estar entre 1 e 5. Recebido: ${skill}`);
    this.name = 'InvalidPlayerSkillError';
  }
}

export class InvalidPlayerNameError extends DomainError {
  constructor() {
    super('Nome do jogador é obrigatório e deve ter no mínimo 3 caracteres.');
    this.name = 'InvalidPlayerNameError';
  }
}
