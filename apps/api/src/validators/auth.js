import { createApiError } from "@novilearn/shared";
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = createApiError(
        "VALIDATION_ERROR",
        "Invalid request payload",
        400,
        result.error.flatten().fieldErrors,
      );
      res.status(400).json(error);
      return;
    }
    req.body = result.data;
    next();
  };
}
