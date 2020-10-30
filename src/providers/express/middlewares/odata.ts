import { InjectContainer } from "@newdash/inject";
import { NextFunction, Request, Response, Router } from "express";
import { InjectType } from "../../../constants";


/**
 * odata middleware 
 * 
 * dynamic handle odata requests in correct tenant
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export async function odataMiddleware(req: Request, res: Response, next: NextFunction) {

  try {
    const container: InjectContainer = res.locals.container;
    const odataRouter: typeof Router = await container.getInstance(InjectType.ODataServerRouter);
    odataRouter['handle'](req, res, next);
  } catch (error) {
    next(error);
  }

}