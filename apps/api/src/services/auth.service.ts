import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import {
  uuid,
  type AuthSession,
  type User,
  type UserRole,
} from '@novilearn/types';

import { config } from '../config';
import { AppError } from '../errors';
import { prisma } from '../prisma';

const BCRYPT_ROUNDS = 12;

interface UserRecord {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  version: number;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: UserRecord): User {
  return {
    id: uuid(user.id),
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function createToken(user: UserRecord): string {
  const payload: TokenClaims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    version: user.tokenVersion,
  };
  const options = {
    expiresIn: config.jwtExpiresIn,
  } as unknown as SignOptions;
  return jwt.sign(payload, config.jwtSecret, options);
}

function createAuthSession(user: UserRecord): AuthSession {
  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSession> {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(
      409,
      'EMAIL_ALREADY_EXISTS',
      'An account with this email already exists',
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

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  const passwordValid =
    user !== null && (await bcrypt.compare(input.password, user.password));
  if (!user || !passwordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  return createAuthSession(user);
}

export async function logoutUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}

export async function getPublicUserById(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return toPublicUser(user);
}
