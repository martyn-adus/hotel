import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateBookingRequestUseCase } from '../application/create-booking-request.usecase';
import { GetBookingRequestUseCase } from '../application/get-booking-request.usecase';
import { GetBookingRequestsUseCase } from '../application/get-booking-requests.usecase';
import { UpdateBookingRequestUseCase } from '../application/update-booking-request.usecase';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { GetBookingRequestsQueryDto } from './dto/get-booking-requests-query.dto';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';
import { Public } from '../../../shared/decorators/public.decorator';

@Controller('booking-requests')
export class BookingRequestController {
  constructor(
    private readonly createBookingRequestUseCase: CreateBookingRequestUseCase,
    private readonly getBookingRequestUseCase: GetBookingRequestUseCase,
    private readonly getBookingRequestsUseCase: GetBookingRequestsUseCase,
    private readonly updateBookingRequestUseCase: UpdateBookingRequestUseCase,
  ) {}

  @Public()
  @Post()
  async create(@Body() createBookingRequestDto: CreateBookingRequestDto) {
    return this.createBookingRequestUseCase.execute(createBookingRequestDto);
  }

  @Get()
  async findAll(@Query() query: GetBookingRequestsQueryDto) {
    return this.getBookingRequestsUseCase.execute(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getBookingRequestUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookingRequestDto: UpdateBookingRequestDto) {
    return this.updateBookingRequestUseCase.execute(id, updateBookingRequestDto);
  }
}
