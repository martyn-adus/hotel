import { BaseEntity } from '../../../shared/domain/persist';
import { UUID } from 'node:crypto';

export class User extends BaseEntity {
  private _email: string;
  private _passwordHash: string;

  constructor(id: UUID, createdAt: Date) {
    super(id, createdAt);
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._passwordHash;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

}
