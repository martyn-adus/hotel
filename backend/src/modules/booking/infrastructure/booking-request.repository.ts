import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BookingRequest, BookingRequestStatus } from '../domain/booking-request.entity';
import { GetBookingRequestsQueryDto } from '../api/dto/get-booking-requests-query.dto';

@Injectable()
export class BookingRequestRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: GetBookingRequestsQueryDto): Promise<{ data: BookingRequest[]; total: number }> {
    const usePagination = filters?.page !== undefined || filters?.limit !== undefined;
    const page = usePagination ? Math.max(filters?.page ?? 1, 1) : undefined;
    const limit = usePagination ? Math.min(Math.max(filters?.limit ?? 10, 1), 100) : undefined;

    const where: any = {
      phoneNumber: filters?.mobileNumber
        ? { contains: filters.mobileNumber, mode: 'insensitive' }
        : undefined,
      checkInDate:
        filters?.checkInDateFrom || filters?.checkInDateTo
          ? {
              gte: filters.checkInDateFrom ? new Date(filters.checkInDateFrom) : undefined,
              lte: filters.checkInDateTo ? new Date(filters.checkInDateTo) : undefined,
            }
          : undefined,
      checkOutDate:
        filters?.checkOutDateFrom || filters?.checkOutDateTo
          ? {
              gte: filters.checkOutDateFrom ? new Date(filters.checkOutDateFrom) : undefined,
              lte: filters.checkOutDateTo ? new Date(filters.checkOutDateTo) : undefined,
            }
          : undefined,
      roomType: filters?.roomTypeName
        ? {
            OR: [
              { type: { contains: filters.roomTypeName, mode: 'insensitive' } },
              { title: { contains: filters.roomTypeName, mode: 'insensitive' } },
            ],
          }
        : undefined,
      OR: filters?.search
        ? [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [bookings, total] = await Promise.all([
      this.prisma.bookingRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit,
      }),
      this.prisma.bookingRequest.count({ where }),
    ]);

    return {
      data: bookings.map((booking) => this.toDomain(booking)),
      total,
    };
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
    patronymic?: string;
    phoneNumber: string;
    email?: string;
    checkInDate: string;
    checkOutDate: string;
    additionalWishes?: string;
    status?: BookingRequestStatus;
    roomTypeId: string;
  }): Promise<BookingRequest> {
    const booking = await this.prisma.bookingRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        patronymic: data.patronymic ?? '',
        phoneNumber: data.phoneNumber,
        email: data.email ?? '',
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
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
      checkInDate?: string;
      checkOutDate?: string;
      additionalWishes?: string;
      status?: BookingRequestStatus;
      roomTypeId?: string;
    },
  ): Promise<BookingRequest> {
    const { checkInDate, checkOutDate, ...rest } = data;
    const booking = await this.prisma.bookingRequest.update({
      where: { id },
      data: {
        ...rest,
        checkInDate: checkInDate ? new Date(checkInDate) : undefined,
        checkOutDate: checkOutDate ? new Date(checkOutDate) : undefined,
      },
    });

    return this.toDomain(booking);
  }

  private toDomain(prismaBooking: any): BookingRequest {
    return Object.assign(
      new BookingRequest(prismaBooking.id, prismaBooking.createdAt, prismaBooking.updatedAt),
      {
      _firstName: prismaBooking.firstName,
      _lastName: prismaBooking.lastName,
      _patronymic: prismaBooking.patronymic,
      _phoneNumber: prismaBooking.phoneNumber,
      _email: prismaBooking.email,
      _checkInDate: prismaBooking.checkInDate ?? undefined,
      _checkOutDate: prismaBooking.checkOutDate ?? undefined,
      _additionalWishes: prismaBooking.additionalWishes,
      _status: prismaBooking.status,
      _roomTypeId: prismaBooking.roomTypeId,
      },
    );
  }
}
