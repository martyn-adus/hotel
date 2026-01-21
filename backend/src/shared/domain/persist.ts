import { UUID } from "node:crypto";

export class BaseEntity {
  constructor(
    private readonly _id: UUID,
    private readonly _createdAt: Date,
  ) {}

  get id(): UUID {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

}
