import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { superAdminMiddleware } from "../middleware/super-admin.middleware";
import { superAdminController } from "../controllers/super-admin.controller";

const router = Router();

router.post(
  "/schools",
  authMiddleware,
  superAdminMiddleware,
  [
    body("name").notEmpty().withMessage("School name is required"),
    body("domain")
      .notEmpty()
      .withMessage("Domain is required")
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage("Domain can only contain letters, numbers, and hyphens"),
    body("contactEmail").isEmail().optional(),
    body("contactPhone").optional(),
    body("address").optional(),
  ],
  validateRequest,
  superAdminController.createSchool
);

router.get(
  "/schools",
  authMiddleware,
  superAdminMiddleware,
  superAdminController.listSchools
);

router.get(
  "/schools/:id",
  authMiddleware,
  superAdminMiddleware,
  superAdminController.getSchool
);

router.put(
  "/schools/:id",
  authMiddleware,
  superAdminMiddleware,
  [
    body("name").optional(),
    body("domain")
      .optional()
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage("Domain can only contain letters, numbers, and hyphens"),
    body("contactEmail").isEmail().optional(),
    body("contactPhone").optional(),
    body("address").optional(),
  ],
  validateRequest,
  superAdminController.updateSchool
);

router.delete(
  "/schools/:id",
  authMiddleware,
  superAdminMiddleware,
  superAdminController.deleteSchool
);

export default router;
