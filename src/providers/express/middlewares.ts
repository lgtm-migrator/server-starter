import { InjectContainer } from "@newdash/inject";
import { createTransactionContext } from "@odata/server";
import express from "express";
import createError from "http-errors";
import { InjectType } from "../../constants";

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


export function createInjectRequestContainer(ic: InjectContainer): express.Handler {

  return async (req, res, next) => {
    try {

      const requestContainer = await ic.createSubContainer();

      requestContainer.registerInstance(InjectType.Request, req);
      requestContainer.registerInstance(InjectType.Response, res);
      requestContainer.registerInstance(InjectType.NextFunction, next);
      requestContainer.registerInstance(InjectType.ODataTransaction, createTransactionContext());

      res.locals.container = requestContainer;

      next();

    } catch (error) {

      next(error);

    }

  };
}



