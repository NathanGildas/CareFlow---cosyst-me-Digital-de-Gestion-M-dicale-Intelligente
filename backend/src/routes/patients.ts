import express from "express";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Module patients - à implémenter",
      endpoints: [
        "GET /api/patients - Liste des patients",
        "POST /api/patients - Créer un patient",
        "GET /api/patients/:id - Détails patient",
      ],
    });
  })
);

export default router;
