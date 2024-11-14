import { Router, Request, Response } from "express";
import { schoolMiddleware } from "../middleware/school.middleware";
import prisma from "../../lib/prisma";

const router = Router();

router.get(
  "/",
  schoolMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const schoolData = await prisma.school.findUnique({
        where: { id: req.school.id },
        select: {
          id: true,
          name: true,
          domain: true,
          teachers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          classes: {
            select: {
              id: true,
              name: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              assignments: {
                select: {
                  id: true,
                  title: true,
                  dueDate: true,
                },
              },
            },
          },
        },
      });

      res.json(schoolData);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/classes/:classId",
  schoolMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const classData = await prisma.class.findFirst({
        where: {
          id: req.params.classId,
          schoolId: req.school.id,
        },
        select: {
          id: true,
          name: true,
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          assignments: {
            select: {
              id: true,
              title: true,
              description: true,
              dueDate: true,
            },
          },
          enrollments: {
            select: {
              student: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!classData) {
        res.status(404).json({ message: "Class not found" });
        return;
      }

      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
