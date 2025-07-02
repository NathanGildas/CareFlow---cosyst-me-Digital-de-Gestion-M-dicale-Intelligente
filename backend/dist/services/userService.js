"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
// src/services/userService.ts - Service utilisateur
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserService {
    async createUser(data) {
        return prisma_1.default.user.create({
            data,
        });
    }
    async getUserById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
        });
    }
    async getUserByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    async updateUser(id, data) {
        return prisma_1.default.user.update({
            where: { id },
            data,
        });
    }
    async deleteUser(id) {
        return prisma_1.default.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map