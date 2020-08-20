import { inject, InjectContainer } from "@newdash/inject";
import { TypedODataServer } from "@odata/server";
import express from "express";
import session from "express-session";
import { createRouter } from "../.internal";
import { Configuration } from "../config";
import { IndexController } from "../controllers/IndexController";
import { ErrorHandler, NotFoundHandler } from "./middlewares";

export class ApplicationServer {

  @inject()
  config: Configuration

  @inject()
  indexController: IndexController

  @inject()
  injectContainer: InjectContainer

  @inject(TypedODataServer)
  odata: typeof TypedODataServer

  async createServer(): Promise<express.Express> {

    const cookieParser = require('cookie-parser');
    const logger = require('morgan');
    const app = express();

    app.use(logger(this.config.get("PROFILE")));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({ secret: "secret" }));

    app.use(createRouter(this.indexController, this.injectContainer));

    app.use("/odata", this.odata.create());

    app.use(NotFoundHandler);
    app.use(ErrorHandler);

    return app;

  }

}

