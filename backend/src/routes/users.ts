import express from "express";
import { asyncHandler } from "../middlewares/errorHandler";
import { prisma } from "../utils/prisma";

const router = express.Router();

// GET /api/users - Liste des utilisateurs
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
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
  })
);

export default router;
