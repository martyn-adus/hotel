import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomTypeRepository } from '../infrastructure/room-type.repository';

@Injectable()
export class UpdateRoomTypeUseCase {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async execute(
    id: string,
    data: {
      type?: string;
      capacity?: number;
      pricePerNight?: number;
      description?: string;
    },
  ) {
    const roomType = await this.roomTypeRepository.findById(id);

    if (!roomType) {
      throw new NotFoundException(`Room type with id ${id} not found`);
    }

    return this.roomTypeRepository.update(id, data);
  }
}
