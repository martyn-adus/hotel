import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingRequestStatus } from '../../domain/booking-request.entity';

export class UpdateBookingRequestDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  patronymic?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  additionalWishes?: string;

  @IsEnum(BookingRequestStatus)
  @IsOptional()
  status?: BookingRequestStatus;

  @IsUUID()
  @IsOptional()
  roomTypeId?: string;
}
