import { Injectable } from '@nestjs/common';
import { BookingRequestRepository } from '../infrastructure/booking-request.repository';
import { BookingRequestStatus } from '../domain/booking-request.entity';

@Injectable()
export class CreateBookingRequestUseCase {
  constructor(private readonly bookingRequestRepository: BookingRequestRepository) {}

  async execute(data: {
    firstName: string;
    lastName: string;
    patronymic: string;
    phoneNumber: string;
    email: string;
    additionalWishes?: string;
    status?: BookingRequestStatus;
    roomTypeId: string;
  }) {
    return this.bookingRequestRepository.create(data);
  }
}
