import createError from "http-errors";

export function NotFoundHandler(req, res, next) {
  next(createError(404));
}

export function ErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: err.message,
    status: err.status | 500
  });
}