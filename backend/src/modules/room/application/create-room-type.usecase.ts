import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from '../infrastructure/room-type.repository';

@Injectable()
export class CreateRoomTypeUseCase {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async execute(data: {
    type: string;
    capacity: number;
    pricePerNight: number;
    description?: string;
  }) {
    return this.roomTypeRepository.create(data);
  }
}
