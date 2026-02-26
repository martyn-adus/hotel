import { BaseEntity } from '../../../shared/domain/persist';
import { UUID } from 'node:crypto';

export class RoomType extends BaseEntity {
  private _type: string;
  private _title: string;
  private _capacity: number;
  private _pricePerNight: number;
  private _description?: string;
  private _mediaUrls: string[] = [];
  private _view: string[] = [];
  private _comfort: string[] = [];

  constructor(id: UUID, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
  }

  get type(): string {
    return this._type;
  }

  get title(): string {
    return this._title;
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

  get view(): string[] {
    return this._view;
  }

  get comfort(): string[] {
    return this._comfort;
  }

}
