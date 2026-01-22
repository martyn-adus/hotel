import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoomTypeUseCase } from '../application/create-room-type.usecase';
import { GetRoomTypesUseCase } from '../application/get-room-types.usecase';
import { GetRoomTypeUseCase } from '../application/get-room-type.usecase';
import { UpdateRoomTypeUseCase } from '../application/update-room-type.usecase';
import { DeleteRoomTypeUseCase } from '../application/delete-room-type.usecase';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { Public } from "../../../shared/decorators/public.decorator";

@Controller('room-types')
export class RoomController {
  constructor(
    private readonly createRoomTypeUseCase: CreateRoomTypeUseCase,
    private readonly getRoomTypesUseCase: GetRoomTypesUseCase,
    private readonly getRoomTypeUseCase: GetRoomTypeUseCase,
    private readonly updateRoomTypeUseCase: UpdateRoomTypeUseCase,
    private readonly deleteRoomTypeUseCase: DeleteRoomTypeUseCase,
  ) {}

  @Post()
  async create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.createRoomTypeUseCase.execute(createRoomTypeDto);
  }

  @Public()
  @Get()
  async findAll() {
    return this.getRoomTypesUseCase.execute();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getRoomTypeUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomTypeDto: UpdateRoomTypeDto) {
    return this.updateRoomTypeUseCase.execute(id, updateRoomTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteRoomTypeUseCase.execute(id);
  }
}
