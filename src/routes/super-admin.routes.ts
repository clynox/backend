import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { superAdminMiddleware } from "../middleware/super-admin.middleware";
import { superAdminController } from "../controllers/super-admin.controller";

const router = Router();

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.post(
  "/schools",
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

router.get("/schools", superAdminController.listSchools);
router.get("/schools/:id", superAdminController.getSchool);

router.put(
  "/schools/:id",
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

router.delete("/schools/:id", superAdminController.deleteSchool);

export default router;
