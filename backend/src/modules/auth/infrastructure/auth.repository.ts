import {Injectable} from "@nestjs/common";

@Injectable()
export class AuthRepository {
    constructor(private prisma: PrismaService) {}

    findByEmail(email: string) {
        return this.prisma.adminUser.findUnique({
            where: { email },
        });
    }
}
