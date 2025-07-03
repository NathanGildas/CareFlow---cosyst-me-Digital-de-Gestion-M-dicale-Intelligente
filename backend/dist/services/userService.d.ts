import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';
declare class UserService {
    createUser(data: CreateUserRequest): Promise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        phone: string | null;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    }>;
    getUserById(id: string): Promise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        phone: string | null;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    } | null>;
    getUserByEmail(email: string): Promise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        phone: string | null;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    } | null>;
    updateUser(id: string, data: UpdateUserRequest): Promise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        phone: string | null;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        phone: string | null;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    }>;
}
export declare const userService: UserService;
export {};
