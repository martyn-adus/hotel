import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './api/auth.controller';
import { LoginUseCase } from './application/login.usecase';
import { AuthRepository } from './infrastructure/auth.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, AuthRepository],
})
export class AuthModule {}
