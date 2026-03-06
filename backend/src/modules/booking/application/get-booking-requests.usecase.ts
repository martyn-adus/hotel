import { Injectable } from '@nestjs/common';
import { BookingRequestRepository } from '../infrastructure/booking-request.repository';
import { GetBookingRequestsQueryDto } from '../api/dto/get-booking-requests-query.dto';

@Injectable()
export class GetBookingRequestsUseCase {
  constructor(private readonly bookingRequestRepository: BookingRequestRepository) {}

  async execute(filters?: GetBookingRequestsQueryDto) {
    return this.bookingRequestRepository.findAll(filters);
  }
}
