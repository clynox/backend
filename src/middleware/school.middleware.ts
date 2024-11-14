import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";
import { School } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      school: School;
    }
  }
}

export const schoolMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subdomain = req.hostname.split(".")[0];

    const domain =
      req.hostname === "localhost"
        ? (req.headers["x-school-domain"] as string)
        : subdomain;

    const school = await prisma.school.findUnique({
      where: { domain },
    });

    if (!school) {
      res.status(404).json({ message: "School not found" });
      return;
    }

    req.school = school;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
