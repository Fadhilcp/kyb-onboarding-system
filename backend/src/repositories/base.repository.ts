import { IBaseRepository } from "./interfaces/IBaseRepository.js";

export class BaseRepository<T, CreateDTO> implements IBaseRepository<T, CreateDTO> {

    constructor(protected readonly model: any) {}

    async create(data: CreateDTO): Promise<T> {
        return await this.model.create({ data });
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findUnique({ where: { id } });
    }

    async findAll(): Promise<T[]> {
        return await this.model.findMany();
    }
}