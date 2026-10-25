import { Prisma, PrismaClient, User } from "@prisma/client";
import { BaseRepository } from "./base.repository.js";
import { IUserRepository } from "./interfaces/IUserRepository.js";

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput> implements IUserRepository {
    constructor(prisma: PrismaClient) {
        super(prisma.user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.model.findUnique({ where: { email } });
    }
}