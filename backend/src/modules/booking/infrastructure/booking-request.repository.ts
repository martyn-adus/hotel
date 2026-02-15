import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BookingRequest, BookingRequestStatus } from '../domain/booking-request.entity';

@Injectable()
export class BookingRequestRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { roomTypeId?: string; search?: string }): Promise<BookingRequest[]> {
    const bookings = await this.prisma.bookingRequest.findMany({
      where: {
        roomTypeId: filters?.roomTypeId,
        OR: filters?.search
          ? [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map((booking) => this.toDomain(booking));
  }

  async findById(id: string): Promise<BookingRequest | null> {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      return null;
    }

    return this.toDomain(booking);
  }

  async create(data: {
    firstName: string;
    lastName: string;
    patronymic: string;
    phoneNumber: string;
    email: string;
    additionalWishes?: string;
    status?: BookingRequestStatus;
    roomTypeId: string;
  }): Promise<BookingRequest> {
    const booking = await this.prisma.bookingRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        patronymic: data.patronymic,
        phoneNumber: data.phoneNumber,
        email: data.email,
        additionalWishes: data.additionalWishes,
        status: data.status ?? BookingRequestStatus.Pending,
        roomTypeId: data.roomTypeId,
      },
    });

    return this.toDomain(booking);
  }

  async update(
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
  ): Promise<BookingRequest> {
    const booking = await this.prisma.bookingRequest.update({
      where: { id },
      data,
    });

    return this.toDomain(booking);
  }

  private toDomain(prismaBooking: any): BookingRequest {
    return Object.assign(new BookingRequest(prismaBooking.id, prismaBooking.createdAt), {
      _firstName: prismaBooking.firstName,
      _lastName: prismaBooking.lastName,
      _patronymic: prismaBooking.patronymic,
      _phoneNumber: prismaBooking.phoneNumber,
      _email: prismaBooking.email,
      _additionalWishes: prismaBooking.additionalWishes,
      _status: prismaBooking.status,
      _roomTypeId: prismaBooking.roomTypeId,
      _updatedAt: prismaBooking.updatedAt,
    });
  }
}
