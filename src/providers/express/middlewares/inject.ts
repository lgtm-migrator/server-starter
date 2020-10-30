import { InjectContainer } from "@newdash/inject";
import { createTransactionContext } from "@odata/server";
import { InjectType } from "../../../constants";

export function createInjectRequestContainer(ic: InjectContainer) {

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
