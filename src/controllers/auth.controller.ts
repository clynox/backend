import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AUTH_CONFIG } from "../config/auth.config";
import { UserRole } from "@prisma/client";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      const result = await AuthService.register({
        email,
        password,
        name,
        role: role as UserRole,
        schoolId: req.school.id,
      });

      res.cookie("token", result.token, AUTH_CONFIG.cookieOptions);
      res.cookie("refreshToken", result.refreshToken, {
        ...AUTH_CONFIG.cookieOptions,
        path: "/auth/refresh-token",
      });

      const { refreshToken, ...response } = result;
      res.json(response);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error ? error.message : "Registration failed",
        });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password, req.school.id);

      res.cookie("token", result.token, AUTH_CONFIG.cookieOptions);
      res.cookie("refreshToken", result.refreshToken, {
        ...AUTH_CONFIG.cookieOptions,
        path: "/auth/refresh-token",
      });

      const { refreshToken, ...response } = result;
      res.json(response);
    } catch (error) {
      res
        .status(401)
        .json({
          message:
            error instanceof Error ? error.message : "Authentication failed",
        });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.cookie("token", result.token, AUTH_CONFIG.cookieOptions);
      res.cookie("refreshToken", result.refreshToken, {
        ...AUTH_CONFIG.cookieOptions,
        path: "/auth/refresh-token",
      });

      const { refreshToken: newRefreshToken, ...response } = result;
      res.json(response);
    } catch (error) {
      res
        .status(401)
        .json({
          message:
            error instanceof Error ? error.message : "Token refresh failed",
        });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.clearCookie("refreshToken", { path: "/auth/refresh-token" });
    res.json({ message: "Logged out successfully" });
  }
}
