import { Application, ApplicationStatus, Prisma, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { IApplicationRepository } from "./interfaces/IApplicationRepository";

export class ApplicationRepository extends BaseRepository<Application, Prisma.ApplicationCreateInput> implements IApplicationRepository {
    constructor(prisma: PrismaClient) {
        super(prisma.application);
    }

    async updateStatus(id: string, status: ApplicationStatus, aiReviewSummary?: Prisma.JsonValue): Promise<Application | null> {
        return await this.model.update({ where: { id }, data: { status, aiReviewSummary } });
    }

    async findManyByStatus(status?: ApplicationStatus): Promise<Application[]> {
        if (!status) {
            return await this.model.findMany();
        }
        return await this.model.findMany({
            where: { status },
            orderBy: { createdAt: "desc" }
        });
    }
}