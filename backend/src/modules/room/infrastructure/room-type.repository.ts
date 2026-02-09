import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoomType } from '../domain/room-type.entity';

@Injectable()
export class RoomTypeRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<RoomType[]> {
    const roomTypes = await this.prisma.roomType.findMany({
      orderBy: { type: 'asc' },
    });
    return roomTypes.map((roomType) => this.toDomain(roomType));
  }

  async findById(id: string): Promise<RoomType | null> {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
    });

    if (!roomType) {
      return null;
    }

    return this.toDomain(roomType);
  }

  async create(data: {
    type: string;
    capacity: number;
    pricePerNight: number;
    description?: string;
    mediaUrls?: string[];
  }): Promise<RoomType> {
    const roomType = await this.prisma.roomType.create({
      data: {
        type: data.type,
        capacity: data.capacity,
        pricePerNight: data.pricePerNight,
        description: data.description,
        mediaUrls: data.mediaUrls ?? [],
      },
    });

    return this.toDomain(roomType);
  }

  async update(
    id: string,
    data: {
      type?: string;
      capacity?: number;
      pricePerNight?: number;
      description?: string;
      mediaUrls?: string[];
    },
  ): Promise<RoomType> {
    const roomType = await this.prisma.roomType.update({
      where: { id },
      data,
    });

    return this.toDomain(roomType);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roomType.delete({
      where: { id },
    });
  }

  private toDomain(prismaRoomType: any): RoomType {
    return Object.assign(new RoomType(prismaRoomType.id, prismaRoomType.createdAt), {
      _type: prismaRoomType.type,
      _capacity: prismaRoomType.capacity,
      _pricePerNight: Number(prismaRoomType.pricePerNight),
      _description: prismaRoomType.description,
      _mediaUrls: prismaRoomType.mediaUrls ?? [],
      _updatedAt: prismaRoomType.updatedAt,
    });
  }
}
