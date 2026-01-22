import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from '../infrastructure/room-type.repository';

@Injectable()
export class GetRoomTypesUseCase {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async execute() {
    return this.roomTypeRepository.findAll();
  }
}
