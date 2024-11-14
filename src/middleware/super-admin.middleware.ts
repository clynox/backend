import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const superAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json({ message: "Access denied. Super Admin only." });
    return;
  }
  next();
};
