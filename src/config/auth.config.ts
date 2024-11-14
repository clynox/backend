export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || "your-default-secret-key",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "your-default-refresh-secret",
  tokenExpiration: "1h",
  refreshTokenExpiration: "7d",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict" as const,
  },
};
