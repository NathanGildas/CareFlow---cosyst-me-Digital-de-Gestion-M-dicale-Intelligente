"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma_1 = require("../utils/prisma");
const router = express_1.default.Router();
// GET /api/users - Liste des utilisateurs
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
        take: 10,
    });
    res.json({
        success: true,
        message: "Liste des utilisateurs",
        data: users,
        count: users.length,
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map