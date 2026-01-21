import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../infrastructure/auth.repository';

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly repo: AuthRepository,
        private readonly jwt: JwtService,
    ) {}

    async execute(email: string, password: string) {
        const user = await this.repo.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
        };

        return {
            accessToken: await this.jwt.signAsync(payload),
        };
    }
}
