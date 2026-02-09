import { IsArray, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateRoomTypeDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerNight?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  mediaUrls?: string[];
}
