import { Injectable } from '@nestjs/common';
import { BookingRequestRepository } from '../infrastructure/booking-request.repository';

@Injectable()
export class GetBookingRequestsUseCase {
  constructor(private readonly bookingRequestRepository: BookingRequestRepository) {}

  async execute(filters?: { roomTypeId?: string; search?: string }) {
    return this.bookingRequestRepository.findAll(filters);
  }
}
