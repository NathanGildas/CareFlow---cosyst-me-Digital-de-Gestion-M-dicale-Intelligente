// src/services/userService.ts - Service utilisateur
import prisma from '../utils/prisma';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

class UserService {
  async createUser(data: CreateUserRequest) {
    return prisma.user.create({
      data,
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const userService = new UserService();