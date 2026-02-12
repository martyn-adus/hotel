import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];
}
