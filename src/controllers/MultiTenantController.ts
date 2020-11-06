import { noWrap } from "@newdash/inject";
import { Request } from "express";
import { Delete, InjectRequest, Put } from "../.internal";
import { hasScope } from "../.internal/decorators/permission";

export class MultiTenantController {

  @Put("/callback/v1.0/tenants/*")
  @hasScope("Callback")
  subscribe(@noWrap @InjectRequest req: Request) {
    const { subscribedSubdomain } = req.body;
    const tenantUrl = `https://${subscribedSubdomain}-${req.headers.host}`;
    console.log(`call subscribe with ${tenantUrl}`);
    // setup DB, create mapping, and other things
    req.res.end(tenantUrl);
  }

  @Delete("/callback/v1.0/tenants/*")
  @hasScope("Callback")
  unSubscribe(@noWrap @InjectRequest req: Request) {
    const { subscribedSubdomain } = req.body;
    const tenantUrl = `https://${subscribedSubdomain}-${req.headers.host}`;
    console.log(`call un-subscribe with ${tenantUrl}`);
    // clean DB, stop metering, and other things
    req.res.status(200).end();
  }

}
