import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRequestRepository } from '../infrastructure/booking-request.repository';
import { BookingRequestStatus } from '../domain/booking-request.entity';

@Injectable()
export class UpdateBookingRequestUseCase {
  constructor(private readonly bookingRequestRepository: BookingRequestRepository) {}

  async execute(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      patronymic?: string;
      phoneNumber?: string;
      email?: string;
      additionalWishes?: string;
      status?: BookingRequestStatus;
      roomTypeId?: string;
    },
  ) {
    const booking = await this.bookingRequestRepository.findById(id);

    if (!booking) {
      throw new NotFoundException(`Booking request with id ${id} not found`);
    }

    return this.bookingRequestRepository.update(id, data);
  }
}
