import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRequestRepository } from '../infrastructure/booking-request.repository';

@Injectable()
export class GetBookingRequestUseCase {
  constructor(private readonly bookingRequestRepository: BookingRequestRepository) {}

  async execute(id: string) {
    const booking = await this.bookingRequestRepository.findById(id);

    if (!booking) {
      throw new NotFoundException(`Booking request with id ${id} not found`);
    }

    return booking;
  }
}
