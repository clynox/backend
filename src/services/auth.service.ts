import { PrismaClient, User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/auth.config";

const prisma = new PrismaClient();

interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  schoolId: string;
}

export class AuthService {
  private static generateTokens(
    userId: string,
    role: UserRole,
    schoolId: string
  ) {
    const token = jwt.sign({ userId, role, schoolId }, AUTH_CONFIG.jwtSecret, {
      expiresIn: AUTH_CONFIG.tokenExpiration,
    });

    const refreshToken = jwt.sign(
      { userId, role, schoolId },
      AUTH_CONFIG.jwtRefreshSecret,
      { expiresIn: AUTH_CONFIG.refreshTokenExpiration }
    );

    return { token, refreshToken };
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        schoolId: data.schoolId,
      },
    });

    if (existingUser) {
      throw new Error("User already exists in this school");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        schoolId: data.schoolId,
      },
    });

    if (data.role === UserRole.TEACHER) {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId: data.schoolId,
          name: data.name,
        },
      });
    } else if (data.role === UserRole.STUDENT) {
      await prisma.student.create({
        data: {
          userId: user.id,
          schoolId: data.schoolId,
          name: data.name,
        },
      });
    }

    const { token, refreshToken } = this.generateTokens(
      user.id,
      user.role,
      user.schoolId
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token, refreshToken };
  }

  static async login(
    email: string,
    password: string,
    schoolId: string
  ): Promise<AuthResponse> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        schoolId,
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const { token, refreshToken } = this.generateTokens(
      user.id,
      user.role,
      user.schoolId
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token, refreshToken };
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    try {
      jwt.verify(refreshToken, AUTH_CONFIG.jwtRefreshSecret);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }

    const tokens = this.generateTokens(user.id, user.role, user.schoolId);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }
}
