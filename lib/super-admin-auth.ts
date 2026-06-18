import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function credentials() {
  return {
    email: process.env.SUPER_ADMIN_EMAIL ?? "",
    password: process.env.SUPER_ADMIN_PASSWORD ?? "",
  };
}

function secret() {
  const { email, password } = credentials();
  return `${email}:${password}:${process.env.DATABASE_URL ?? "local"}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function validateSuperAdminCredentials(email: string, password: string) {
  const expected = credentials();
  if (!expected.email || !expected.password) return false;
  return email.trim().toLowerCase() === expected.email.trim().toLowerCase() && password === expected.password;
}

export function createSuperAdminToken(email: string) {
  const issuedAt = Date.now();
  const normalized = email.trim().toLowerCase();
  const payload = `${normalized}:${issuedAt}`;
  return `${payload}:${sign(payload)}`;
}

export function verifySuperAdminToken(token?: string | null) {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [email, issuedAtText, signature] = parts;
  const issuedAt = Number(issuedAtText);
  if (!email || !Number.isFinite(issuedAt) || Date.now() - issuedAt > TOKEN_TTL_MS) return false;

  const expectedEmail = credentials().email.trim().toLowerCase();
  if (!expectedEmail || email !== expectedEmail) return false;

  const payload = `${email}:${issuedAtText}`;
  const expected = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function adminTokenFromRequest(request: Request) {
  return request.headers.get("x-super-admin-token");
}
