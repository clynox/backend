import { Request, Response } from "express";
import prisma from "../../lib/prisma";

async function createSchool(req: Request, res: Response): Promise<void> {
  try {
    const { name, domain, contactEmail, contactPhone, address } = req.body;

    const existingSchool = await prisma.school.findUnique({
      where: { domain },
    });

    if (existingSchool) {
      res.status(400).json({ message: "Domain already exists" });
      return;
    }

    const school = await prisma.school.create({
      data: {
        name,
        domain,
        contactEmail,
        contactPhone,
        address,
      },
    });

    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create school",
    });
  }
}

async function listSchools(req: Request, res: Response): Promise<void> {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
            classes: true,
          },
        },
      },
    });

    res.json(schools);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to list schools",
    });
  }
}

async function getSchool(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
            classes: true,
          },
        },
      },
    });

    if (!school) {
      res.status(404).json({ message: "School not found" });
      return;
    }

    res.json(school);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to get school",
    });
  }
}

async function updateSchool(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, domain, contactEmail, contactPhone, address } = req.body;

    if (domain) {
      const existingSchool = await prisma.school.findFirst({
        where: {
          domain,
          id: { not: id },
        },
      });

      if (existingSchool) {
        res.status(400).json({ message: "Domain already exists" });
        return;
      }
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        name,
        domain,
        contactEmail,
        contactPhone,
        address,
      },
    });

    res.json(school);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to update school",
    });
  }
}

async function deleteSchool(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.school.delete({
      where: { id },
    });

    res.json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete school",
    });
  }
}

// Export object containing all controller functions
export const superAdminController = {
  createSchool,
  listSchools,
  getSchool,
  updateSchool,
  deleteSchool,
};
