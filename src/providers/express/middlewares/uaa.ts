
import { cacheIt } from "@newdash/newdash/cacheIt";
import { TTLCacheProvider } from "@newdash/newdash/cacheProvider";
import { trimSuffix } from "@newdash/newdash/trimSuffix";
import ClientOAuth2, { Options } from 'client-oauth2';
import express, { Request } from "express";
import got from "got";
import jwt from "jsonwebtoken";
import url from "url";

/**
 * fetch verify key with cache
 */
const fetchVerifyKey = cacheIt(async (jku, kid) => {
  const { keys } = await got(jku).json();
  const key = keys.filter(key => key.kid === kid)[0];
  return key?.value;
}, { provider: TTLCacheProvider, providerArgs: [60 * 60 * 1000, 60 * 1000] }); // with timeout cache (1 hour expire)

const localhost = ['localhost', '127.0.0.1'];

const isLocalHostDev = (req: Request) => localhost.includes(req.hostname);

// dynamic get redirect url
const getRedirectUrl = (req: Request) => {
  const host = req.headers.host;
  // for local debug
  if (isLocalHostDev(req)) {
    return `http://${host}/login/callback`;
  }
  return `https://${host}/login/callback`;
};

const getUAAHost = (req: Request, uaa: any, appHost: string) => {
  // remote client provided host
  const host = req.headers.host;
  const uaadomain = uaa.uaadomain;

  // local dev
  if (isLocalHostDev(req)) {
    return url.parse(uaa.url).hostname;
  }
  // from main provision
  if (host === appHost) {
    return url.parse(uaa.url).hostname;
  }
  // from sub tenant
  else {
    const prefix = trimSuffix(host, `-${appHost}`);
    return `${prefix}.${uaadomain}`;
  }
};


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

const createOAuthOptionsBuilder = (uaa: any, appHost: string) => (req: Request, options: Options = {}): Options => {
  return {
    ...options,
    authorizationUri: `https://${getUAAHost(req, uaa, appHost)}/oauth/authorize`,
    accessTokenUri: `https://${getUAAHost(req, uaa, appHost)}/oauth/token`,
  };
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

  const application = JSON.parse(process.env.VCAP_APPLICATION);
  const applicationMainHost = application.application_uris[0];

  const oauth = new ClientOAuth2({
    clientId: uaaCredential.clientid,
    clientSecret: uaaCredential.clientsecret,
  });

  const buildOAuthOptions = createOAuthOptionsBuilder(uaaCredential, applicationMainHost);

  // public oauth login callback
  app.get("/login/callback", async req => {

    if (req.session.login === true) {
      req.next(new Error("You have logged, please do not access this url again."));
    }
    else {

      try {

        // get user access token (can NOT be verified with public key)
        const token = await oauth.code.getToken(
          req.originalUrl,
          buildOAuthOptions(
            req,
            {
              redirectUri: getRedirectUrl(req)
            }
          )
        );

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


  // middleware to process auth
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
          const token = await oauth.owner.getToken(username, password, buildOAuthOptions(req));
          const user = await verifyAccessToken(token.accessToken, uaaCredential);

          // verified token
          req.session.login = true;
          req.session.user = user;
          req.session.jwt = token.accessToken;

          // go to next handler
          req.next();
        }
        // without jwt/basic authentication
        else {
          // store url to oauth.state
          req.res.redirect(oauth.code.getUri(buildOAuthOptions(req, {
            state: req.originalUrl,
            redirectUri: getRedirectUrl(req),
          })));
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
