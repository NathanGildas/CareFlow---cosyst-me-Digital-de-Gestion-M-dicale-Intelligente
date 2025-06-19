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
        message: "Module rendez-vous - à implémenter",
        endpoints: [
            "GET /api/appointments - Liste des RDV",
            "POST /api/appointments - Créer un RDV",
            "PUT /api/appointments/:id - Modifier RDV",
        ],
    });
}));
exports.default = router;
//# sourceMappingURL=appointments.js.map