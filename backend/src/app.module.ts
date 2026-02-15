import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { FilesModule } from './modules/files/files.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [PrismaModule, AuthModule, RoomModule, FilesModule, BookingModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
