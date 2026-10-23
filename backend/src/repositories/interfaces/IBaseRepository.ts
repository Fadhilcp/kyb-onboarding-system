export interface IBaseRepository<T, CreateDTO> {
  create(data: CreateDTO): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}