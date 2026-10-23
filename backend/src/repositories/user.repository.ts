import { Prisma, PrismaClient, User } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput> implements IUserRepository {
    constructor(prisma: PrismaClient) {
        super(prisma.user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.model.findUnique({ where: { email } });
    }
}