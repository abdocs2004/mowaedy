import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function zodToFieldErrors(err) {
  const errors = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/**
 * validate({ body, query, params }) — parses with zod schemas and replaces the request parts
 * with the parsed (typed, stripped) values. Unknown keys are removed by the schemas.
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = zodToFieldErrors(err);
      const first = Object.values(errors)[0];
      return next(new AppError(first || 'بيانات غير صالحة', 400, 'VALIDATION_ERROR', errors));
    }
    next(err);
  }
};
