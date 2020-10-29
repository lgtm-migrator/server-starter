import { InjectContainer } from "@newdash/inject";
import { cacheIt } from "@newdash/newdash/cacheIt";
import { TTLCacheProvider } from "@newdash/newdash/cacheProvider";
import { createTransactionContext } from "@odata/server";
import ClientOAuth2 from 'client-oauth2';
import express, { NextFunction, Request, Response } from "express";
import got from "got";
import createError, { HttpError } from "http-errors";
import jwt from "jsonwebtoken";
import url from "url";
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


/**
 * fetch verify key with cache
 */
const fetchVerifyKey = cacheIt(async (jku, kid) => {
  const { keys } = await got(jku).json();
  const key = keys.filter(key => key.kid === kid)[0];
  return key?.value;
}, { provider: TTLCacheProvider, providerArgs: [60 * 60 * 1000, 60 * 1000] }); // with timeout cache (1 hour expire)


// TO DO, use prefix to navigate to correct url
// dynamic get redirect url
const getRedirectUrl = (req: Request) => `https://${req.headers.host}/login/callback`;

const verifyAccessToken = async (accessToken: string, uaaCredential: any) => {
  const { jku, kid } = jwt.decode(accessToken, { complete: true })['header'];

  if (jku === undefined || kid === undefined) {
    throw new Error("Not valid jwt.");
  }

  if (jku.startsWith(uaaCredential.url)) {
    // convert XSUAA provided key to valid nodejs format (with line break)
    const localUAAProvidedVerifyKey = uaaCredential.verificationkey
      .replace(/-----BEGIN PUBLIC KEY-----/g, "-----BEGIN PUBLIC KEY-----\n")
      .replace(/-----END PUBLIC KEY-----/g, "\n-----END PUBLIC KEY-----");
    // verify with injected key
    return jwt.verify(accessToken, localUAAProvidedVerifyKey);
  }

  const jkuHostName = url.parse(jku).hostname;

  if (jkuHostName.endsWith(uaaCredential.uaadomain)) {
    // verify with remote key
    return jwt.verify(accessToken, await fetchVerifyKey(jku, kid));
  }

  throw new Error("not valid jku.");

};

/**
 * 
 * attach the uaa authentication & authorization to express app
 * 
 * ref the [cf uaa doc](https://docs.cloudfoundry.org/api/uaa/version/74.27.0/index.html#overview)
 * 
 * @param app 
 * @param uaaCredential 
 * @param appUri 
 */
export function withUAA(app: express.Express, uaaCredential) {

  // TO DO, update uaa target with multi-tenant
  const oauth = new ClientOAuth2({
    authorizationUri: `${uaaCredential.url}/oauth/authorize`,
    accessTokenUri: `${uaaCredential.url}/oauth/token`,
    clientId: uaaCredential.clientid,
    clientSecret: uaaCredential.clientsecret,
  });

  // public oauth login callback
  app.get("/login/callback", async req => {

    if (req.session.login === true) {
      req.next(new Error("You have logged, please do not access this url again."));
    }
    else if (!('code' in req.query)) {
      // callback called, but not provider 'code'
      req.next(new Error("Not valid callback, must provide 'code' in query parameters."));
    }
    else {

      try {

        // get user access token (can NOT be verified with public key)
        const token = await oauth.code.getToken(req.originalUrl, {
          redirectUri: getRedirectUrl(req)
        });

        // verify jwt
        const user = await verifyAccessToken(token.accessToken, uaaCredential);

        req.session.user = user;
        req.session.login = true;
        // it can forward to other applications
        req.session.jwt = token.accessToken;

        // redirect to previous url, if state lost, default to '/user'
        req.res.redirect(req.query['state'] as string || '/user');

      } catch (error) {

        req.next(error);

      }

    }



  });

  app.use(async (req: Request) => {

    try {
      // session is not login
      if (req.session.login !== true) {
        // inbound request with jwt (offline login)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
          try {
            // read jwt token from header
            const authorizationContent = req.headers.authorization.substr(7);
            const user = await verifyAccessToken(authorizationContent, uaaCredential);

            // verified token
            req.session.login = true;
            req.session.user = user;
            req.session.jwt = authorizationContent;

            // go to next handler
            req.next();
          } catch (error) {
            // not verified token
            req.next(error);
          }
        }
        // inbound request with basic auth (remote call required)
        else if (req.headers.authorization && req.headers.authorization.startsWith("Basic ")) {
          // for API call, developer could use TTL cache the user/password result in short time period
          const authorizationContent = req.headers.authorization.substr(6);
          const [username, password] = Buffer
            .from(authorizationContent, 'base64')
            .toString('utf8')
            .split(":");
          const token = await oauth.owner.getToken(username, password);
          const user = await verifyAccessToken(token.accessToken, uaaCredential);

          // verified token
          req.session.login = true;
          req.session.user = user;
          req.session.jwt = token.accessToken;

          // go to next handler
          req.next();
        }
        // without any other
        else {
          // store url to oauth.state
          req.res.redirect(oauth.code.getUri({
            state: req.originalUrl,
            redirectUri: getRedirectUrl(req)
          }));
        }
      } else {
        // session is login
        req.next();
      }

    } catch (error) {
      req.next(error);
    }

  });
}


