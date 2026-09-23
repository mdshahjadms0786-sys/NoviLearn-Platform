import jwt from "jsonwebtoken";

import { config } from "../config.js";
import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
import { toPublicUser } from "../services/auth.service.js";
const BEARER_PREFIX = "Bearer ";
function extractBearerToken(authorization) {
  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = authorization.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}
export function authenticate(req, _res, next) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }
  let claims;
  try {
    claims = jwt.verify(token, config.jwtSecret);
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
    return;
  }
  void prisma.user
    .findUnique({
      where: {
        id: claims.sub,
      },
    })
    .then((user) => {
      const authenticated = req;
      if (!user || user.tokenVersion !== claims.version) {
        next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
        return;
      }
      authenticated.user = toPublicUser(user);
      authenticated.claims = claims;
      next();
    })
    .catch(next);
}
