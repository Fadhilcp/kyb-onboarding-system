import { Role } from "@prisma/client";

export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    user: {
        id: string;
        email: string;
        role: Role;
    }
}