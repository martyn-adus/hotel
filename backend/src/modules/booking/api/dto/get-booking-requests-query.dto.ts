import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetBookingRequestsQueryDto {
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  roomTypeName?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  checkInDateFrom?: string;

  @IsDateString()
  @IsOptional()
  checkInDateTo?: string;

  @IsDateString()
  @IsOptional()
  checkOutDateFrom?: string;

  @IsDateString()
  @IsOptional()
  checkOutDateTo?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
