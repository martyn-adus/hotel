import { BaseEntity } from '../../../shared/domain/persist';
import { UUID } from 'node:crypto';

export enum BookingRequestStatus {
  Pending = 'pending',
  Processed = 'processed',
  Confirmed = 'confirmed',
  Declined = 'declined',
}

export class BookingRequest extends BaseEntity {
  private _firstName: string;
  private _lastName: string;
  private _patronymic: string;
  private _phoneNumber: string;
  private _email: string;
  private _additionalWishes?: string;
  private _status: BookingRequestStatus;
  private _roomTypeId: string;

  constructor(id: UUID, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get patronymic(): string {
    return this._patronymic;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  get email(): string {
    return this._email;
  }

  get additionalWishes(): string | undefined {
    return this._additionalWishes;
  }

  get status(): BookingRequestStatus {
    return this._status;
  }

  get roomTypeId(): string {
    return this._roomTypeId;
  }
}
