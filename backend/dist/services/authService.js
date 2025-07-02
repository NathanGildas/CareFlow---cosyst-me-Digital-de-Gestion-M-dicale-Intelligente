"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
// src/services/authService.ts - Service d'authentification
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        }
        catch {
            return null;
        }
    }
    async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 12);
    }
    async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map