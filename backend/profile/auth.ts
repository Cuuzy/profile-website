import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
}

// Simple admin login (in production, use proper password hashing)
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/admin/login" },
  async (req) => {
    const admin = await profileDB.queryRow<{ id: number; username: string; password_hash: string }>`
      SELECT id, username, password_hash
      FROM admins 
      WHERE username = ${req.username}
    `;

    if (!admin) {
      throw APIError.unauthenticated("Invalid credentials");
    }

    // Simple password check (in production, use bcrypt)
    if (req.password !== "admin123") {
      throw APIError.unauthenticated("Invalid credentials");
    }

    // Simple token generation (in production, use JWT)
    const token = Buffer.from(`${admin.username}:${Date.now()}`).toString('base64');

    return {
      success: true,
      token,
    };
  }
);

// Verify admin token
export const verifyToken = api<VerifyTokenRequest, VerifyTokenResponse>(
  { expose: true, method: "POST", path: "/admin/verify" },
  async (req) => {
    try {
      const decoded = Buffer.from(req.token, 'base64').toString();
      const [username, timestamp] = decoded.split(':');
      
      // Check if token is not older than 24 hours
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const isValid = (now - tokenTime) < (24 * 60 * 60 * 1000);

      return { valid: isValid };
    } catch {
      return { valid: false };
    }
  }
);
