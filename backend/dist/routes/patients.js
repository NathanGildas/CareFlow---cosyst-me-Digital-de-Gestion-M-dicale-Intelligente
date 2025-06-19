"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middlewares/errorHandler");
const router = express_1.default.Router();
router.get("/", (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: "Module patients - à implémenter",
        endpoints: [
            "GET /api/patients - Liste des patients",
            "POST /api/patients - Créer un patient",
            "GET /api/patients/:id - Détails patient",
        ],
    });
}));
exports.default = router;
//# sourceMappingURL=patients.js.map