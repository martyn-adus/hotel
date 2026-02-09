import { BaseEntity } from '../../../shared/domain/persist';
import { UUID } from 'node:crypto';

export class RoomType extends BaseEntity {
  private _type: string;
  private _capacity: number;
  private _pricePerNight: number;
  private _description?: string;
  private _mediaUrls: string[] = [];
  private _updatedAt: Date;

  constructor(id: UUID, createdAt: Date) {
    super(id, createdAt);
  }

  get type(): string {
    return this._type;
  }

  get capacity(): number {
    return this._capacity;
  }

  get pricePerNight(): number {
    return this._pricePerNight;
  }

  get description(): string | undefined {
    return this._description;
  }

  get mediaUrls(): string[] {
    return this._mediaUrls;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
