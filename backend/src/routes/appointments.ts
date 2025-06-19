import express from "express";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Module rendez-vous - à implémenter",
      endpoints: [
        "GET /api/appointments - Liste des RDV",
        "POST /api/appointments - Créer un RDV",
        "PUT /api/appointments/:id - Modifier RDV",
      ],
    });
  })
);

export default router;
