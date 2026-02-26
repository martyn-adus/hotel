import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../domain/user';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async create(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
      },
    });

    return this.toDomain(user);
  }

  private toDomain(prismaUser: any): User {
    return Object.assign(new User(prismaUser.id, prismaUser.createdAt, prismaUser.updatedAt), {
      _email: prismaUser.email,
      _passwordHash: prismaUser.password,
    });
  }
}
