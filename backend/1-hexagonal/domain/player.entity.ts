import { PlayerData, PlayerPosition, PlayerStats } from '../../shared/types/player.types.js';
import { InvalidPlayerNameError, InvalidPlayerSkillError } from './player.errors.js';

export class Player {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _nickname: string | undefined,
    private _gender: 'M' | 'F' | 'Misto',
    private _position: PlayerPosition,
    private _skillLevel: number,
    private _height: number | undefined,
    private _dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro',
    private _avatar: string | undefined,
    private _teamId: string | null | undefined,
    private _bio: string | undefined,
    private _stats: PlayerStats
  ) {}

  public static create(data: PlayerData): Player {
    Player.validate(data.name, data.skillLevel);

    return new Player(
      data.id,
      data.name.trim(),
      data.nickname?.trim(),
      data.gender,
      data.position,
      data.skillLevel,
      data.height,
      data.dominantHand,
      data.avatar,
      data.teamId,
      data.bio,
      data.stats || { matches: 0, wins: 0, pointsScored: 0, mvps: 0 }
    );
  }

  private static validate(name: string, skillLevel: number): void {
    if (!name || name.trim().length < 3) {
      throw new InvalidPlayerNameError();
    }
    if (skillLevel < 1 || skillLevel > 5) {
      throw new InvalidPlayerSkillError(skillLevel);
    }
  }

  public updateInfo(data: Partial<Omit<PlayerData, 'id'>>): void {
    if (data.name !== undefined) {
      if (data.name.trim().length < 3) throw new InvalidPlayerNameError();
      this._name = data.name.trim();
    }
    if (data.skillLevel !== undefined) {
      if (data.skillLevel < 1 || data.skillLevel > 5) throw new InvalidPlayerSkillError(data.skillLevel);
      this._skillLevel = data.skillLevel;
    }
    if (data.nickname !== undefined) this._nickname = data.nickname?.trim();
    if (data.gender !== undefined) this._gender = data.gender;
    if (data.position !== undefined) this._position = data.position;
    if (data.height !== undefined) this._height = data.height;
    if (data.dominantHand !== undefined) this._dominantHand = data.dominantHand;
    if (data.avatar !== undefined) this._avatar = data.avatar;
    if (data.teamId !== undefined) this._teamId = data.teamId;
    if (data.bio !== undefined) this._bio = data.bio;
    if (data.stats !== undefined) this._stats = data.stats;
  }

  public toDTO(): PlayerData {
    return {
      id: this._id,
      name: this._name,
      nickname: this._nickname,
      gender: this._gender,
      position: this._position,
      skillLevel: this._skillLevel,
      height: this._height,
      dominantHand: this._dominantHand,
      avatar: this._avatar,
      teamId: this._teamId,
      bio: this._bio,
      stats: { ...this._stats }
    };
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get skillLevel(): number { return this._skillLevel; }
  get position(): PlayerPosition { return this._position; }
}
