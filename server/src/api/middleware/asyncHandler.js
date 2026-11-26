// Express 4 doesn't catch rejected promises, so wrap async handlers.
export const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);