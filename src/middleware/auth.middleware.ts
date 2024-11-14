import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/auth.config";
import prisma from "../../lib/prisma";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role: UserRole;
  schoolId: string;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
        schoolId: string;
        email: string;
        name?: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, AUTH_CONFIG.jwtSecret) as JwtPayload;
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (req.path.startsWith("/super-admin")) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { teacher: true, student: true },
      });

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = {
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email,
        name: user.teacher?.name || user.student?.name,
      };

      return next();
    }

    if (!req.school?.id) {
      res.status(500).json({ message: "School context not available" });
      return;
    }

    if (decoded.schoolId !== req.school.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { teacher: true, student: true },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
      email: user.email,
      name: user.teacher?.name || user.student?.name,
    };

    next();
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
