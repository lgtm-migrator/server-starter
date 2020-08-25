import { createInjectDecorator, inject, InjectContainer, noWrap, withType } from "@newdash/inject";
import { TypedODataServer } from "@odata/server";
import express from "express";
import session from "express-session";
import { createRouter, register } from "../../.internal";
import { Configuration } from "../../config";
import { InjectType } from "../../constants";
import { injectControllers } from "../controllers";
import { ErrorHandler, NotFoundHandler } from "./middlewares";

@register
export class ServerProvider {

  @inject()
  config: Configuration

  @injectControllers
  controllers: any[]

  @inject(TypedODataServer)
  odata: typeof TypedODataServer

  @inject()
  injectContainer: InjectContainer

  @withType(InjectType.Server)
  @noWrap
  async provide(): Promise<express.Express> {

    const cookieParser = require('cookie-parser');
    const logger = require('morgan');
    const app = express();

    // app.use(logger('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
    this.controllers.forEach(controller => {
      app.use(createRouter(controller, this.injectContainer));
    });

    app.use("/odata", this.odata.create());

    app.use(NotFoundHandler);
    app.use(ErrorHandler);

    return app;

  }

}

export const injectServer = createInjectDecorator(InjectType.Server);

