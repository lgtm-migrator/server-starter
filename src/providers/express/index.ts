import { createInjectDecorator, inject, InjectContainer, noWrap, transient, withType } from "@newdash/inject";
import { TypedODataServer } from "@odata/server";
import express from "express";
import session from "express-session";
import { createRouter, register } from "../../.internal";
import { Configuration } from "../../config";
import { InjectType } from "../../constants";
import { injectControllers } from "../controllers";
import { createInjectRequestContainer, ErrorHandler, NotFoundHandler, withUAA } from "./middlewares";

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

  @transient
  @withType(InjectType.Server)
  @noWrap
  async provide(): Promise<express.Express> {

    const cookieParser = require('cookie-parser');
    const app = express();

    app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

    const uaaService = this.config.get("xsuaa");

    if (uaaService !== undefined) {
      withUAA(app, uaaService.credentials);
    }

    // app.use(logger('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());


    app.use(createInjectRequestContainer(this.injectContainer));

    this.controllers.forEach(controller => {
      app.use(createRouter(controller));
    });

    app.use("/odata", this.odata.create());

    app.use(NotFoundHandler);
    app.use(ErrorHandler);

    return app;

  }

}

export const injectServer = createInjectDecorator(InjectType.Server);

