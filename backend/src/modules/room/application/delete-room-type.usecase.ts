import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomTypeRepository } from '../infrastructure/room-type.repository';

@Injectable()
export class DeleteRoomTypeUseCase {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async execute(id: string) {
    const roomType = await this.roomTypeRepository.findById(id);

    if (!roomType) {
      throw new NotFoundException(`Room type with id ${id} not found`);
    }

    await this.roomTypeRepository.delete(id);
  }
}
