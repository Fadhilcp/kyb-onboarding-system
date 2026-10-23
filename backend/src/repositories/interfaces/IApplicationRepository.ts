import { Application, ApplicationStatus, Prisma } from "@prisma/client";
import { IBaseRepository } from "./IBaseRepository";

export interface IApplicationRepository extends IBaseRepository<Application, Prisma.ApplicationCreateInput> {
    updateStatus(id: string, status: ApplicationStatus, aiReviewSummary?: Prisma.JsonValue): Promise<Application | null>;
    findManyByStatus(status?: ApplicationStatus): Promise<Application[]>;
}