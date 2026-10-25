import { Prisma, User } from "@prisma/client";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IUserRepository extends IBaseRepository<User, Prisma.UserCreateInput> {
    findByEmail(email: string): Promise<User | null>;
}