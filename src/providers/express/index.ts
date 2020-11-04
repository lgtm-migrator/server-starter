import { createInjectDecorator, inject, InjectContainer, noWrap, transient, withType } from "@newdash/inject";
import express from "express";
import session from "express-session";
import { createRouter, register, withConfigValue } from "../../.internal";
import { Configuration } from "../../config";
import { InjectType } from "../../constants";
import { injectControllers } from "../controllers";
import { createInjectRequestContainer, ErrorHandler, NotFoundHandler, odataMiddleware, withUAA } from "./middlewares";

@register
export class ServerProvider {

  @inject()
  config: Configuration

  @injectControllers
  controllers: any[]

  @inject(InjectType.Services)
  services: any[]

  @withConfigValue("xsuaa")
  @noWrap
  uaaConfig: any

  @inject()
  injectContainer: InjectContainer

  @transient
  @withType(InjectType.Server)
  @noWrap
  async provide(): Promise<express.Express> {

    const cookieParser = require('cookie-parser');
    const app = express();

    app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

    if (this.uaaConfig !== undefined) {
      withUAA(app, this.uaaConfig.credentials);
    }

    // app.use(logger('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use(createInjectRequestContainer(this.injectContainer));

    this.controllers.forEach(controller => {
      app.use(createRouter(controller));
    });

    app.use("/odata", odataMiddleware);

    app.use(NotFoundHandler);
    app.use(ErrorHandler);

    return app;

  }

}

export const injectServer = createInjectDecorator(InjectType.Server);

