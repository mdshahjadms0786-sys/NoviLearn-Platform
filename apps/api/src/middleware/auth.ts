import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { User } from '@novilearn/types';

import { config } from '../config';
import { AppError } from '../errors';
import { prisma } from '../prisma';
import { toPublicUser } from '../services/auth.service';

interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  version: number;
}

export interface AuthenticatedRequest extends Request {
  user: User;
  claims: TokenClaims;
}

const BEARER_PREFIX = 'Bearer ';

function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = authorization.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  let claims: TokenClaims;
  try {
    claims = jwt.verify(token, config.jwtSecret) as TokenClaims;
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    return;
  }

  void prisma.user
    .findUnique({ where: { id: claims.sub } })
    .then((user) => {
      const authenticated = req as AuthenticatedRequest;
      if (!user || user.tokenVersion !== claims.version) {
        next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
        return;
      }
      authenticated.user = toPublicUser(user);
      authenticated.claims = claims;
      next();
    })
    .catch(next);
}
