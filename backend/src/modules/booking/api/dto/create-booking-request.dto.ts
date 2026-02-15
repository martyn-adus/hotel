import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBookingRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  patronymic: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsUUID()
  roomTypeId: string;

  @IsString()
  @IsOptional()
  additionalWishes?: string;
}
