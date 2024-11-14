import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { schoolMiddleware } from "../middleware/school.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/register",
  schoolMiddleware,
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("role").isIn(["TEACHER", "STUDENT"]),
  ],
  validateRequest,
  AuthController.register
);

router.post(
  "/login",
  schoolMiddleware,
  [body("email").isEmail(), body("password").notEmpty()],
  validateRequest,
  AuthController.login
);

router.post("/refresh-token", schoolMiddleware, AuthController.refreshToken);

router.post("/logout", schoolMiddleware, authMiddleware, AuthController.logout);

export default router;
