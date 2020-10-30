import { NextFunction, Request, Response } from "express";
import createError, { HttpError } from "http-errors";

export function NotFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
}

export function ErrorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || 500);
  res.json({
    error: err.message,
    status: err.status | 500
  });
}

export { createInjectRequestContainer } from "./inject";
export { odataMiddleware } from "./odata";
export { withUAA } from "./uaa";

