import { Module } from '@nestjs/common';
import { RoomController } from './api/room.controller';
import { CreateRoomTypeUseCase } from './application/create-room-type.usecase';
import { GetRoomTypesUseCase } from './application/get-room-types.usecase';
import { GetRoomTypeUseCase } from './application/get-room-type.usecase';
import { UpdateRoomTypeUseCase } from './application/update-room-type.usecase';
import { DeleteRoomTypeUseCase } from './application/delete-room-type.usecase';
import { RoomTypeRepository } from './infrastructure/room-type.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomController],
  providers: [
    RoomTypeRepository,
    CreateRoomTypeUseCase,
    GetRoomTypesUseCase,
    GetRoomTypeUseCase,
    UpdateRoomTypeUseCase,
    DeleteRoomTypeUseCase,
  ],
  exports: [RoomTypeRepository],
})
export class RoomModule {}
