import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { uuid } from "@novilearn/types";

import { config } from "../config.js";
import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
const BCRYPT_ROUNDS = 12;
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
export function toPublicUser(user) {
  return {
    id: uuid(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
function createToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    version: user.tokenVersion,
  };
  const options = {
    expiresIn: config.jwtExpiresIn,
  };
  return jwt.sign(payload, config.jwtSecret, options);
}
function createAuthSession(user) {
  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}
export async function signupUser(input) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "An account with this email already exists",
    );
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: passwordHash,
    },
  });
  return createAuthSession(user);
}
export async function loginUser(input) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  const passwordValid =
    user !== null && (await bcrypt.compare(input.password, user.password));
  if (!user || !passwordValid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  return createAuthSession(user);
}
export async function logoutUser(userId) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
  });
}
export async function getPublicUserById(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
  return toPublicUser(user);
}
