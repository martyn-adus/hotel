import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateBookingRequestUseCase } from '../application/create-booking-request.usecase';
import { GetBookingRequestsUseCase } from '../application/get-booking-requests.usecase';
import { UpdateBookingRequestUseCase } from '../application/update-booking-request.usecase';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('booking-requests')
export class BookingRequestController {
  constructor(
    private readonly createBookingRequestUseCase: CreateBookingRequestUseCase,
    private readonly getBookingRequestsUseCase: GetBookingRequestsUseCase,
    private readonly updateBookingRequestUseCase: UpdateBookingRequestUseCase,
  ) {}

  @Public()
  @Post()
  async create(@Body() createBookingRequestDto: CreateBookingRequestDto) {
    return this.createBookingRequestUseCase.execute(createBookingRequestDto);
  }

  @Get()
  async findAll(
    @Query('roomTypeId') roomTypeId?: string,
    @Query('search') search?: string,
  ) {
    return this.getBookingRequestsUseCase.execute({ roomTypeId, search });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookingRequestDto: UpdateBookingRequestDto) {
    return this.updateBookingRequestUseCase.execute(id, updateBookingRequestDto);
  }
}
