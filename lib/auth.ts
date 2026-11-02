import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "convodeck_session";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SESSION_SECRET ||
  "convodeck_jwt_production_secret_key_2026_super_secure";

// 1. Password Hashing using Node.js built-in pbkdf2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512");
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// 2. JWT Session Payload Structure
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
  tokenVersion?: number;
}

// 3. JSON Web Token Creation & Verification using jsonwebtoken
export function createToken(data: SessionData): string {
  return jwt.sign(
    {
      userId: data.userId,
      email: data.email,
      name: data.name,
      role: data.role,
      workspaceId: data.workspaceId,
      tokenVersion: data.tokenVersion ?? 0,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    if (!decoded || !decoded.userId) return null;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      workspaceId: decoded.workspaceId,
      tokenVersion: decoded.tokenVersion,
    };
  } catch {
    return null;
  }
}

// 4. Cookie Management (HTTP-only, Secure, SameSite=Lax, 7-day TTL)
export async function setSessionCookie(data: SessionData) {
  const token = createToken(data);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// 5. Total Session Termination / Cookie Clearance
export async function clearSessionCookie() {
  const cookieStore = await cookies();

  // 1. Next.js explicit delete with root path & options
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // 2. Overwrite cookie with empty value and instant past expiration
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
