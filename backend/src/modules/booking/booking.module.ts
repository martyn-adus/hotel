import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BookingRequestController } from './api/booking-request.controller';
import { CreateBookingRequestUseCase } from './application/create-booking-request.usecase';
import { GetBookingRequestsUseCase } from './application/get-booking-requests.usecase';
import { UpdateBookingRequestUseCase } from './application/update-booking-request.usecase';
import { BookingRequestRepository } from './infrastructure/booking-request.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BookingRequestController],
  providers: [
    BookingRequestRepository,
    CreateBookingRequestUseCase,
    GetBookingRequestsUseCase,
    UpdateBookingRequestUseCase,
  ],
  exports: [BookingRequestRepository],
})
export class BookingModule {}
