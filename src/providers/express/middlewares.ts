import { InjectContainer } from "@newdash/inject";
import { createTransactionContext } from "@odata/server";
import ClientOAuth2 from 'client-oauth2';
import express, { NextFunction, Request, Response } from "express";
import createError, { HttpError } from "http-errors";
import jwt from "jsonwebtoken";
import { InjectType } from "../../constants";

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


export function withUAA(app: express.Express, uaaCredential, appUri) {

  const oauth = new ClientOAuth2({
    authorizationUri: `${uaaCredential.url}/oauth/authorize`,
    accessTokenUri: `${uaaCredential.url}/oauth/token`,
    clientId: uaaCredential.clientid,
    clientSecret: uaaCredential.clientsecret,
    redirectUri: `${appUri}/login/callback`
  });


  const verifyKey = uaaCredential.verificationkey
    .replace(/-----BEGIN PUBLIC KEY-----/g, "-----BEGIN PUBLIC KEY-----\n")
    .replace(/-----END PUBLIC KEY-----/g, "\n-----END PUBLIC KEY-----");

  app.get("/login/callback", async req => {

    try {
      const token = await oauth.code.getToken(req.originalUrl);
      const { id_token } = token.data;
      const user = jwt.verify(id_token, verifyKey);

      req.session.user = user;
      req.session.login = true;

      req.res.redirect(req.query['state'] as string || '/user');

    } catch (error) {
      req.next(error);
    }

  });

  app.use((req: Request) => {

    // session not login
    if (req.session.login !== true) {
      // with jwt
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        try {
          const user = jwt.verify(req.headers.authorization.substr(7), verifyKey);
          // verified token
          req.session.login = true;
          req.session.user = user;
          req.next(); // go to next handler
        } catch (error) {
          // not verified token
          req.next(error);
        }
      }
      // without jwt
      else {
        req.res.redirect(oauth.code.getUri({ state: req.originalUrl }));
      }
    } else {
      req.next();
    }

  });
}


