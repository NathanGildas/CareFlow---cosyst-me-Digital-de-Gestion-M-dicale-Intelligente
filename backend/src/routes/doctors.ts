import express from "express";
import { asyncHandler } from "../middlewares/errorHandler";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Module médecins - à implémenter",
      endpoints: [
        "GET /api/doctors - Liste des médecins",
        "POST /api/doctors - Créer un médecin",
        "GET /api/doctors/:id - Détails médecin",
      ],
    });
  })
);

export default router;
